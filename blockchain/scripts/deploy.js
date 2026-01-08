const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // ─────────────────────────────────────────────
  // Deploy GarbageBlockchainCoin (needs admin)
  // ─────────────────────────────────────────────
  const GBC = await ethers.getContractFactory("GarbageBlockchainCoin");
  const gbc = await GBC.deploy(deployer.address);
  await gbc.waitForDeployment();

  const gbcAddress = await gbc.getAddress();
  console.log("GarbageBlockchainCoin deployed at:", gbcAddress);

  // ─────────────────────────────────────────────
  // Deploy RewardManager (needs admin + GBC address)
  // ─────────────────────────────────────────────
  const RewardManager = await ethers.getContractFactory("RewardManager");
  const rewardManager = await RewardManager.deploy(
    deployer.address,
    gbcAddress
  );
  await rewardManager.waitForDeployment();

  const rewardManagerAddress = await rewardManager.getAddress();
  console.log("RewardManager deployed at:", rewardManagerAddress);

  // ─────────────────────────────────────────────
  // Grant MINTER_ROLE on GBC to RewardManager
  // ─────────────────────────────────────────────
  const MINTER_ROLE = await gbc.MINTER_ROLE();
  const grantTx = await gbc.grantRole(MINTER_ROLE, rewardManagerAddress);
  await grantTx.wait();

  console.log("Granted MINTER_ROLE on GBC to RewardManager");

  // Helpful reminders
  const ORACLE_ROLE = await rewardManager.ORACLE_ROLE();
  console.log("RewardManager ORACLE_ROLE hash:", ORACLE_ROLE);
  console.log(
    "NEXT STEP: grant ORACLE_ROLE to backend oracle wallet:",
    deployer.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
