const db = require("../db");

async function recordTransaction({ userId, type, amount, tokenSymbol, direction, txHash, metadata }) {
  const [result] = await db.execute(
    "INSERT INTO transactions (user_id, type, amount, token_symbol, direction, tx_hash, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, type, amount, tokenSymbol, direction, txHash, JSON.stringify(metadata || {})]
  );
  return { id: result.insertId };
}

async function listTransactionsForUser(userId) {
  const [rows] = await db.execute(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

module.exports = { recordTransaction, listTransactionsForUser };
