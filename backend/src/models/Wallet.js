const db = require("../db");

async function createWallet({ userId, address, nonce }) {
  const [result] = await db.execute(
    "INSERT INTO wallets (user_id, address, nonce, verified) VALUES (?, ?, ?, 0)",
    [userId, address, nonce]
  );
  return { id: result.insertId, user_id: userId, address, nonce, verified: 0 };
}

async function findWalletByAddress(address) {
  const [rows] = await db.execute("SELECT * FROM wallets WHERE address = ?", [address]);
  return rows[0] || null;
}

async function listWalletsForUser(userId) {
  const [rows] = await db.execute("SELECT * FROM wallets WHERE user_id = ?", [userId]);
  return rows;
}

async function updateWalletVerification(id, verified) {
  await db.execute("UPDATE wallets SET verified = ? WHERE id = ?", [verified ? 1 : 0, id]);
}

async function updateWalletNonce(id, nonce) {
  await db.execute("UPDATE wallets SET nonce = ? WHERE id = ?", [nonce, id]);
}

module.exports = {
  createWallet,
  findWalletByAddress,
  listWalletsForUser,
  updateWalletVerification,
  updateWalletNonce
};
