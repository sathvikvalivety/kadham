const { ethers } = require("ethers");
const crypto = require("crypto");

const Wallet = require("../models/Wallet");

function generateNonce() {
  return crypto.randomBytes(16).toString("hex");
}

async function requestWalletLink(req, res) {
  const { address } = req.body;
  const userId = req.user.id;

  const normalized = ethers.getAddress(address);
  let wallet = await Wallet.findWalletByAddress(normalized);

  const nonce = generateNonce();

  if (!wallet) {
    wallet = await Wallet.createWallet({ userId, address: normalized, nonce });
  } else {
    await Wallet.updateWalletNonce(wallet.id, nonce);
  }

  return res.json({
    address: normalized,
    nonce,
    messageToSign: `Kadham wallet verification nonce: ${nonce}`
  });
}

async function verifyWalletSignature(req, res) {
  const { address, signature } = req.body;
  const userId = req.user.id;

  const normalized = ethers.getAddress(address);
  const wallet = await Wallet.findWalletByAddress(normalized);

  if (!wallet || wallet.user_id !== userId) {
    return res.status(400).json({ message: "Wallet link request not found" });
  }

  const message = `Kadham wallet verification nonce: ${wallet.nonce}`;
  const recovered = ethers.verifyMessage(message, signature);

  if (ethers.getAddress(recovered) !== normalized) {
    return res.status(400).json({ message: "Signature verification failed" });
  }

  await Wallet.updateWalletVerification(wallet.id, true);

  return res.json({ verified: true, address: normalized });
}

async function listWallets(req, res) {
  const wallets = await Wallet.listWalletsForUser(req.user.id);
  return res.json(wallets);
}

module.exports = { requestWalletLink, verifyWalletSignature, listWallets };
