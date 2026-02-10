const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const rewardManagerAddress = "0xDACC059289E05aD8ecDBFD453b6d65b212105546"; // From user logs
    const oracleAddress = deployer.address; // Assuming deployer is the oracle for dev

    console.log("Using account:", deployer.address);
    console.log("RewardManager:", rewardManagerAddress);

    const RewardManager = await ethers.getContractFactory("RewardManager");
    const rewardManager = RewardManager.attach(rewardManagerAddress);

    const ORACLE_ROLE = await rewardManager.ORACLE_ROLE();
    console.log("ORACLE_ROLE:", ORACLE_ROLE);

    const hasRole = await rewardManager.hasRole(ORACLE_ROLE, oracleAddress);
    if (hasRole) {
        console.log("✅ Oracle already has the role.");
    } else {
        console.log("⏳ Granting ORACLE_ROLE...");
        const tx = await rewardManager.grantRole(ORACLE_ROLE, oracleAddress);
        await tx.wait();
        console.log("✅ Role granted successfully!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
