const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Garbage Blockchain Coin (GBC)
    const GarbageBlockchainCoin = await hre.ethers.getContractFactory("GarbageBlockchainCoin");
    const gbc = await GarbageBlockchainCoin.deploy(deployer.address);
    await gbc.waitForDeployment();
    const gbcAddress = await gbc.getAddress();
    console.log("GarbageBlockchainCoin deployed to:", gbcAddress);

    // 2. Deploy RewardManager
    const RewardManager = await hre.ethers.getContractFactory("RewardManager");
    const rewardManager = await RewardManager.deploy(deployer.address, gbcAddress);
    await rewardManager.waitForDeployment();
    const rewardManagerAddress = await rewardManager.getAddress();
    console.log("RewardManager deployed to:", rewardManagerAddress);

    let dexAddress = "";
    let bridgeAddress = "";

    // 3. Deploy SimpleDEX (Rate: 100 GBC per 1 ETH)
    try {
        const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
        const rate = 100;
        const dex = await SimpleDEX.deploy(gbcAddress, rate);
        await dex.waitForDeployment();
        dexAddress = await dex.getAddress();
        console.log("SimpleDEX deployed to:", dexAddress);
    } catch (error) {
        console.error("SimpleDEX Deployment Failed:", error.message);
    }

    // 4. Deploy GBCBridge
    try {
        const GBCBridge = await hre.ethers.getContractFactory("GBCBridge");
        const bridge = await GBCBridge.deploy(gbcAddress);
        await bridge.waitForDeployment();
        bridgeAddress = await bridge.getAddress();
        console.log("GBCBridge deployed to:", bridgeAddress);
    } catch (error) {
        console.error("GBCBridge Deployment Failed:", error.message);
    }

    // --- Configuration ---
    try {
        console.log("Configuring Roles and Funding...");

        // Grant MINTER_ROLE to RewardManager on GBC
        const MINTER_ROLE = await gbc.MINTER_ROLE();
        await gbc.grantRole(MINTER_ROLE, rewardManagerAddress);
        console.log("Granted MINTER_ROLE to RewardManager");

        // Grant ORACLE_ROLE to Deployer on RewardManager
        const RewardManagerContract = await hre.ethers.getContractAt("RewardManager", rewardManagerAddress);
        const ORACLE_ROLE = await RewardManagerContract.ORACLE_ROLE();
        await RewardManagerContract.grantRole(ORACLE_ROLE, deployer.address);
        console.log("Granted ORACLE_ROLE to Deployer (Oracle)");


        if (bridgeAddress) {
            // Grant MINTER_ROLE to GBCBridge
            await gbc.grantRole(MINTER_ROLE, bridgeAddress);
            console.log("Granted MINTER_ROLE to GBCBridge");
        }

        if (dexAddress) {
            // Fund the DEX with some GBC (Minted by Deployer who has ADMIN/MINTER role initially)
            const dexFundingAmount = hre.ethers.parseUnits("10000", 18);
            await gbc.mint(dexAddress, dexFundingAmount);
            console.log("Minted 10,000 GBC to SimpleDEX for trading liquidity");
        }
    } catch (error) {
        console.error("Configuration Failed:", error.message);
    }

    console.log("Deployment Complete (Check for errors above if any addresses missing)!");
    console.log("----------------------------------------------------");
    console.log(`VITE_GBC_TOKEN_ADDRESS=${gbcAddress}`);
    console.log(`VITE_REWARD_MANAGER_ADDRESS=${rewardManagerAddress}`);
    console.log(`VITE_DEX_ADDRESS=${dexAddress}`);
    console.log(`VITE_BRIDGE_ADDRESS=${bridgeAddress}`);
    console.log("----------------------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
