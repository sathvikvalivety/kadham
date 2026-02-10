const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Mistral } = require("@mistralai/mistralai");
require("dotenv").config();

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));

const PORT = process.env.AI_SERVICE_PORT || 5001;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
    console.warn("⚠️ MISTRAL_API_KEY is not set in .env file. AI integration will fail.");
}

const client = new Mistral({ apiKey: MISTRAL_API_KEY });

// =====================================================
// Helper: Extract JSON from AI response
// =====================================================
function extractJson(text) {
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace("```json", "").replace("```", "").trim();
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
        throw new Error("No JSON found in response");
    }
    return JSON.parse(text.substring(start, end + 1));
}

// =====================================================
// Endpoint: Analyze Waste for Reuse & Greener Alternatives
// =====================================================
app.post("/analyze-waste-reuse", async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: "Image is required" });
    }

    try {
        console.log("[AI SERVICE] Starting waste reuse analysis...");

        // STEP 1: Vision Analysis - Identify item and material
        const visionPrompt = `Identify the MAIN OBJECT and its material.

Respond ONLY in JSON:
{
  "item": "common object name in lowercase",
  "material": "Plastic | Metal | Paper | Fabric | Organic | Glass | Electronic | Unknown",
  "confidence": 0-100
}

Rules:
- Item must be specific (e.g. sunglasses, towel, bottle)
- Do NOT guess
- No explanation`;

        const visionResp = await client.chat.complete({
            model: "pixtral-12b",
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: visionPrompt },
                    { type: "image_url", imageUrl: image }
                ]
            }],
            responseFormat: { type: "json_object" }
        });

        const visionData = JSON.parse(visionResp.choices[0].message.content);
        const { item, material, confidence } = visionData;

        console.log(`[AI SERVICE] Vision analysis: ${item} (${material}) - ${confidence}% confidence`);

        // STEP 2: Reasoning Analysis - Greener alternatives and DIY ideas
        const reusePrompt = `You are a sustainability expert.

Item: ${item}
Material: ${material}

First decide if this item is ALREADY eco-friendly and reusable.

Examples of already eco-friendly items:
- Metal water bottle
- Glass bottle
- Steel lunch box
cdc- Cloth bag

Respond ONLY in JSON:
{
  "is_already_eco_friendly": true | false,
  "alternatives": [],
  "diy": [
    {
      "title": "short DIY or care idea title",
      "youtube_search": "youtube search query"
    }
  ]
}

Rules:
- If is_already_eco_friendly is TRUE:
  - alternatives MUST be an empty array
- If is_already_eco_friendly is FALSE:
  - alternatives should suggest realistic eco-friendly replacements
- DIY ideas must relate to the SAME item
- If nothing makes sense, return empty arrays
- Do NOT explain`;

        const reuseResp = await client.chat.complete({
            model: "mistral-large-latest",
            messages: [{ role: "user", content: reusePrompt }],
            responseFormat: { type: "json_object" }
        });

        const reuseData = JSON.parse(reuseResp.choices[0].message.content);

        console.log("[AI SERVICE] Reuse analysis complete");

        // Return combined results
        return res.json({
            item,
            material,
            confidence,
            is_already_eco_friendly: reuseData.is_already_eco_friendly,
            alternatives: reuseData.alternatives || [],
            diy: reuseData.diy || []
        });

    } catch (err) {
        console.error("[AI SERVICE] Waste reuse analysis failed:", err.message);
        return res.status(500).json({
            error: "Analysis failed",
            message: err.message
        });
    }
});

app.post("/analyze", async (req, res) => {
    const { depositId, description, image } = req.body;

    console.log(`[AI SERVICE] Received Mistral analysis request for Deposit #${depositId}`);
    res.json({ status: "processing", depositId });

    setTimeout(async () => {
        try {
            console.log(`[AI SERVICE] Calling Mistral (Pixtral-12b) for #${depositId}...`);

            // Prepare image for Mistral (keep the data:image/jpeg;base64,... format if needed or split)
            // The image usually comes as "data:image/png;base64,....", Mistral accepts data URIs

            const prompt = `Analyze this image of waste and the description: "${description || 'No description provided'}". 
            Determine the primary material type based ONLY on these categories: PLASTIC, ALUMINUM_METAL, PAPER_CARDBOARD, ORGANIC_WASTE, GLASS, or UNCLASSIFIED.
            
            Return ONLY a JSON object in this format:
            {"materialType": "...", "weightKg": 0.5, "ecoScore": 85, "remarks": "Short summary"}`;

            const response = await client.chat.complete({
                model: "pixtral-12b",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                imageUrl: image // Express handles base64 data URI directly
                            }
                        ]
                    }
                ],
                responseFormat: { type: "json_object" }
            });

            const responseText = response.choices[0].message.content;
            const analysis = JSON.parse(responseText);

            console.log(`[AI SERVICE] Mistral Analysis complete for #${depositId}:`, analysis);

            // 3. Callback to Backend
            await axios.post(`${BACKEND_URL}/api/ai/verify`, {
                depositId,
                status: "APPROVED",
                materialType: analysis.materialType,
                weightKg: parseFloat(analysis.weightKg) || 0.5,
                ecoScore: parseInt(analysis.ecoScore) || 50,
                remarks: analysis.remarks || "Analyzed by Mistral"
            });
            console.log(`[AI SERVICE] Successfully reported back for #${depositId}`);
        } catch (err) {
            console.error(`[AI SERVICE] AI Analysis failed for #${depositId}:`, err.message);
            // Fallback to approved mixed recyclables on error to prevent blocking user flow
            try {
                await axios.post(`${BACKEND_URL}/api/ai/verify`, {
                    depositId,
                    status: "APPROVED",
                    materialType: "MIXED_RECYCLABLES",
                    weightKg: 0.5,
                    ecoScore: 50,
                    remarks: "Fallback: AI Service error or missing Mistral API Key."
                });
            } catch (innerErr) {
                console.error("[AI SERVICE] Even fallback failed:", innerErr.message);
            }
        }
    }, 100);
});

app.listen(PORT, () => {
    console.log(`🚀 Kadham AI Service (Mistral Powered) running on port ${PORT}`);
});
