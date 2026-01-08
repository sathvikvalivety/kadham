const db = require("../db");

async function listEcoProducts() {
  const [rows] = await db.execute("SELECT * FROM eco_products ORDER BY eco_score DESC");
  return rows;
}

async function findEcoProductById(id) {
  const [rows] = await db.execute("SELECT * FROM eco_products WHERE id = ?", [id]);
  return rows[0] || null;
}

module.exports = { listEcoProducts, findEcoProductById };
