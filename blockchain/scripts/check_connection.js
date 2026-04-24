const hre = require("hardhat");

async function main() {
    try {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log("Connection successful. Current block number:", blockNumber);
    } catch (error) {
        console.error("Connection failed:", error.message);
        process.exit(1);
    }
}

main();
