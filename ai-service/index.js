const express = require("express");
const axios = require("axios");
const { Mistral } = require("@mistralai/mistralai");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.AI_SERVICE_PORT || 5001;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
    console.warn("⚠️ MISTRAL_API_KEY is not set in .env file. AI integration will fail.");
}

const client = new Mistral({ apiKey: MISTRAL_API_KEY });

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
