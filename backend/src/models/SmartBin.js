const db = require("../db");

async function listSmartBins() {
  const [rows] = await db.execute("SELECT * FROM smart_bins ORDER BY id DESC");
  return rows;
}

async function createSmartBin({ location, qrCode }) {
  const [result] = await db.execute(
    "INSERT INTO smart_bins (location, qr_code, status) VALUES (?, ?, ?)",
    [location, qrCode, "ACTIVE"]
  );
  return { id: result.insertId, location, qr_code: qrCode, status: "ACTIVE" };
}

module.exports = { listSmartBins, createSmartBin };
