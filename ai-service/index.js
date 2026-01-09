const express = require("express");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.AI_SERVICE_PORT || 5001;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is not set in .env file. AI integration will fail.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/analyze", async (req, res) => {
    const { depositId, description, image } = req.body;

    console.log(`[AI SERVICE] Received Gemini analysis request for Deposit #${depositId}`);
    res.json({ status: "processing", depositId });

    setTimeout(async () => {
        try {
            console.log(`[AI SERVICE] Calling Gemini Vision API for #${depositId}...`);

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Prepare image for Gemini (remove data:image/png;base64, prefix)
            const base64Data = image.split(",")[1];
            const imageParts = [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/png"
                    }
                }
            ];

            const prompt = `Analyze this image of waste and the description: "${description || 'No description provided'}". 
            Determine:
            1. Material Type (Choose one: PLASTIC, ALUMINUM_METAL, PAPER_CARDBOARD, ORGANIC_WASTE, GLASS, or UNCLASSIFIED)
            2. Estimated Weight in kg (a number between 0.01 and 10.0)
            3. Eco Score (a number between 1 and 100 based on recyclability)
            
            Return ONLY a JSON object in this format:
            {"materialType": "...", "weightKg": 0.0, "ecoScore": 0, "remarks": "Short summary of what you see"}`;

            const result = await model.generateContent([prompt, ...imageParts]);
            const responseText = result.response.text();

            // Clean response text (Gemini sometimes adds markdown blocks)
            const jsonMatch = responseText.match(/\{.*\}/s);
            const analysis = JSON.parse(jsonMatch[0]);

            console.log(`[AI SERVICE] Gemini Analysis complete for #${depositId}:`, analysis);

            // 3. Callback to Backend
            await axios.post(`${BACKEND_URL}/api/ai/verify`, {
                depositId,
                status: "APPROVED",
                materialType: analysis.materialType,
                weightKg: parseFloat(analysis.weightKg),
                ecoScore: parseInt(analysis.ecoScore),
                remarks: analysis.remarks
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
                    remarks: "Fallback: AI Service error or missing API Key."
                });
            } catch (innerErr) {
                console.error("[AI SERVICE] Even fallback failed:", innerErr.message);
            }
        }
    }, 100);
});

app.listen(PORT, () => {
    console.log(`🚀 Kadham AI Service (Gemini Powered) running on port ${PORT}`);
});
