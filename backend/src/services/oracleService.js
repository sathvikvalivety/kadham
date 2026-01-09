const { ethers } = require("ethers");
const config = require("../config");

let provider;
let wallet;
let rewardManagerContract;

const rewardManagerAbi = [
  "function rewardDeposit(address user, uint256 amount, bytes32 offchainDepositId) external",
  "event RewardIssued(address indexed user, uint256 amount, bytes32 indexed offchainDepositId)"
];

function initOracle() {
  if (
    !config.blockchain.rpcUrl ||
    !config.blockchain.rewardManagerAddress ||
    !config.blockchain.oraclePrivateKey
  ) {
    console.warn("Oracle not fully configured. Blockchain operations will be disabled.");
    return;
  }

  provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  wallet = new ethers.Wallet(config.blockchain.oraclePrivateKey, provider);
  rewardManagerContract = new ethers.Contract(
    config.blockchain.rewardManagerAddress,
    rewardManagerAbi,
    wallet
  );
}

async function issueRewardForDeposit({ userAddress, amountGbc, offchainDepositId }) {
  if (!rewardManagerContract) {
    throw new Error("Oracle not initialized or blockchain configuration missing");
  }

  const amountWei = ethers.parseUnits(String(amountGbc), 18);
  const idBytes = ethers.id(String(offchainDepositId));

  const tx = await rewardManagerContract.rewardDeposit(userAddress, amountWei, idBytes);
  const receipt = await tx.wait();

  return { txHash: receipt.hash };
}

initOracle();

module.exports = { issueRewardForDeposit };
