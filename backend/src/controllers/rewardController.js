const WasteDeposit = require("../models/WasteDeposit");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const { issueRewardForDeposit } = require("../services/oracleService");

async function rewardDeposit(req, res) {
  const { depositId, amountGbc } = req.body;
  const userId = req.user.id;

  const deposit = await WasteDeposit.findWasteDepositById(depositId);
  if (!deposit || deposit.user_id !== userId) {
    return res.status(404).json({ message: "Deposit not found" });
  }

  if (deposit.status !== "APPROVED") {
    return res.status(400).json({ message: "Deposit is not approved for rewards" });
  }

  if (deposit.tx_hash) {
    return res.status(400).json({ message: "Deposit has already been rewarded" });
  }

  const wallets = await Wallet.listWalletsForUser(userId);
  const primaryWallet = wallets.find((w) => w.verified);

  if (!primaryWallet) {
    return res.status(400).json({ message: "No verified wallet found" });
  }

  try {
    const { txHash } = await issueRewardForDeposit({
      userAddress: primaryWallet.address,
      amountGbc,
      offchainDepositId: deposit.id
    });

    await WasteDeposit.attachTxHash(deposit.id, txHash);
    await Transaction.recordTransaction({
      userId,
      type: "REWARD",
      amount: amountGbc || 0,
      tokenSymbol: "GBC",
      direction: "CREDIT",
      txHash: txHash || null,
      metadata: { depositId: deposit.id }
    });

    return res.json({ txHash });
  } catch (err) {
    console.error("[REWARD_CLAIM_FAILED]", err);
    return res.status(500).json({
      message: "Blockchain reward failed",
      error: err.reason || err.message || "Unknown error"
    });
  }
}

module.exports = { rewardDeposit };
