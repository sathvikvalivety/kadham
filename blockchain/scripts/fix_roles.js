const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking roles with account:", deployer.address);

    const rewardManagerAddress = process.env.VITE_REWARD_MANAGER_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Hardcoded from .env if env var not picked up by hardhat
    const gbcAddress = process.env.VITE_GBC_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("RewardManager Address:", rewardManagerAddress);
    console.log("GBC Address:", gbcAddress);

    // 1. Check ORACLE_ROLE on RewardManager
    const RewardManager = await hre.ethers.getContractAt("RewardManager", rewardManagerAddress);
    const ORACLE_ROLE = await RewardManager.ORACLE_ROLE();
    const hasOracleRole = await RewardManager.hasRole(ORACLE_ROLE, deployer.address);
    console.log(`Deployer has ORACLE_ROLE on RewardManager: ${hasOracleRole}`);

    if (!hasOracleRole) {
        console.log("Granting ORACLE_ROLE to deployer...");
        const tx = await RewardManager.grantRole(ORACLE_ROLE, deployer.address);
        await tx.wait();
        console.log("ORACLE_ROLE granted!");
    }

    // 2. Check MINTER_ROLE on GBC (for RewardManager)
    const GBC = await hre.ethers.getContractAt("GarbageBlockchainCoin", gbcAddress);
    const MINTER_ROLE = await GBC.MINTER_ROLE();
    const hasMinterRole = await GBC.hasRole(MINTER_ROLE, rewardManagerAddress);
    console.log(`RewardManager has MINTER_ROLE on GBC: ${hasMinterRole}`);

    if (!hasMinterRole) {
        console.log("Granting MINTER_ROLE to RewardManager...");
        const tx = await GBC.grantRole(MINTER_ROLE, rewardManagerAddress);
        await tx.wait();
        console.log("MINTER_ROLE granted!");
    }

    console.log("Role Check & Fix Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
