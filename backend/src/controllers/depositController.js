const WasteDeposit = require("../models/WasteDeposit");

async function createDeposit(req, res) {
  const { binId, description } = req.body;
  const userId = req.user.id;

  const deposit = await WasteDeposit.createWasteDeposit({ userId, binId, description });
  return res.status(201).json(deposit);
}

async function listMyDeposits(req, res) {
  const deposits = await WasteDeposit.listWasteDepositsForUser(req.user.id);
  return res.json(deposits);
}

module.exports = { createDeposit, listMyDeposits };
