const WasteDeposit = require("../models/WasteDeposit");

// This endpoint represents the interface where AI will plug in later.
// It currently applies deterministic stub logic without any ML or image processing.
async function verifyDeposit(req, res) {
  const { depositId } = req.body;

  const deposit = await WasteDeposit.findWasteDepositById(depositId);
  if (!deposit) {
    return res.status(404).json({ message: "Deposit not found" });
  }

  const ecoScore = 80;
  const status = "APPROVED";

  await WasteDeposit.updateWasteDepositVerification({
    id: depositId,
    status,
    materialType: "MIXED_RECYCLABLES",
    weightKg: 1.0,
    ecoScore
  });

  return res.json({
    verified: true,
    depositId,
    materialType: "MIXED_RECYCLABLES",
    weightKg: 1.0,
    ecoScore,
    confidence: 0.9,
    explanations: "Stubbed verification. Replace with AI service integration."
  });
}

module.exports = { verifyDeposit };
