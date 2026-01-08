const Transaction = require("../models/Transaction");

async function listMyTransactions(req, res) {
  const txs = await Transaction.listTransactionsForUser(req.user.id);
  return res.json(txs);
}

module.exports = { listMyTransactions };
