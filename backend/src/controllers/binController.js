const SmartBin = require("../models/SmartBin");

async function listBins(req, res) {
  const bins = await SmartBin.listSmartBins();
  return res.json(bins);
}

async function createBin(req, res) {
  const { location, qrCode } = req.body;
  const bin = await SmartBin.createSmartBin({ location, qrCode });
  return res.status(201).json(bin);
}

module.exports = { listBins, createBin };
