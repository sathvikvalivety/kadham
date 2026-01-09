const db = require("../db");

async function createWasteDeposit({ userId, binId, description, image }) {
  const [result] = await db.execute(
    "INSERT INTO waste_deposits (user_id, bin_id, description, image_data, status) VALUES (?, ?, ?, ?, ?)",
    [userId, binId, description || "", image || null, "PENDING_VERIFICATION"]
  );
  return {
    id: result.insertId,
    user_id: userId,
    bin_id: binId,
    description,
    image_data: image,
    status: "PENDING_VERIFICATION"
  };
}

async function updateWasteDepositVerification({ id, status, materialType, weightKg, ecoScore }) {
  await db.execute(
    "UPDATE waste_deposits SET status = ?, material_type = ?, weight_kg = ?, eco_score = ? WHERE id = ?",
    [status, materialType || null, weightKg || null, ecoScore || null, id]
  );
}

async function attachTxHash(id, txHash) {
  await db.execute("UPDATE waste_deposits SET tx_hash = ? WHERE id = ?", [txHash, id]);
}

async function findWasteDepositById(id) {
  const [rows] = await db.execute("SELECT * FROM waste_deposits WHERE id = ?", [id]);
  return rows[0] || null;
}

async function listWasteDepositsForUser(userId) {
  const [rows] = await db.execute(
    "SELECT * FROM waste_deposits WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

module.exports = {
  createWasteDeposit,
  updateWasteDepositVerification,
  attachTxHash,
  findWasteDepositById,
  listWasteDepositsForUser
};
