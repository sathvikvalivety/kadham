const { ethers } = require("hardhat");

async function mintMissing() {
    const [deployer] = await ethers.getSigners();
    const gbcAddress = "0xBdA4FE258eD93902DB172bB4E2c5634dca64753A";
    const userAddress = "0xc749a8AA29eA5dC40CA09479DF5d0418408Fe994"; // From logs
    const amount = "85";

    console.log(`Minting ${amount} GBC to ${userAddress}...`);

    const GBC = await ethers.getContractFactory("GarbageBlockchainCoin");
    const gbc = GBC.attach(gbcAddress);

    // Grant MINTER_ROLE to deployer temporarily (if lost) or just try minting if admin
    const MINTER_ROLE = await gbc.MINTER_ROLE();
    if (!await gbc.hasRole(MINTER_ROLE, deployer.address)) {
        console.log("Granting MINTER_ROLE to self...");
        await (await gbc.grantRole(MINTER_ROLE, deployer.address)).wait();
    }

    const tx = await gbc.mint(userAddress, ethers.parseUnits(amount, 18));
    await tx.wait();

    console.log("✅ Minted successfully!");
}

mintMissing().catch(console.error);
