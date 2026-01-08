const db = require("../db");

async function createUser({ email, passwordHash, role }) {
  const [result] = await db.execute(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    [email, passwordHash, role || "user"]
  );
  return { id: result.insertId, email, role: role || "user" };
}

async function findUserByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById };
