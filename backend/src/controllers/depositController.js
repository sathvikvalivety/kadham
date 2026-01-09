const WasteDeposit = require("../models/WasteDeposit");
const axios = require("axios");

async function createDeposit(req, res) {
  const { binId, description, image } = req.body;
  const userId = req.user.id;

  const deposit = await WasteDeposit.createWasteDeposit({ userId, binId, description, image });

  // Trigger AI Analysis
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";
    // Fire and forget, but catch local error to prevent crash
    axios.post(`${AI_SERVICE_URL}/analyze`, {
      depositId: deposit.id,
      description,
      image
    }).catch(err => console.error("[BACKEND] AI Service Trigger Failed (Check if service is running):", err.message));
  } catch (err) {
    console.error("[BACKEND] Error triggering AI service:", err.message);
  }

  return res.status(201).json(deposit);
}

async function listMyDeposits(req, res) {
  const deposits = await WasteDeposit.listWasteDepositsForUser(req.user.id);
  return res.json(deposits);
}

module.exports = { createDeposit, listMyDeposits };
