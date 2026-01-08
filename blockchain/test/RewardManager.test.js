const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardManager", function () {
  async function deployFixture() {
    const [admin, oracle, user] = await ethers.getSigners();

    const GBC = await ethers.getContractFactory("GarbageBlockchainCoin");
    const gbc = await GBC.deploy(admin.address);
    await gbc.waitForDeployment();

    const RewardManager = await ethers.getContractFactory(\"RewardManager\");
    const rm = await RewardManager.deploy(admin.address, gbc.target);
    await rm.waitForDeployment();

    const MINTER_ROLE = await gbc.MINTER_ROLE();
    const ORACLE_ROLE = await rm.ORACLE_ROLE();

    await gbc.grantRole(MINTER_ROLE, rm.target);
    await rm.grantRole(ORACLE_ROLE, oracle.address);

    return { admin, oracle, user, gbc, rm, ORACLE_ROLE };
  }

  it("only oracle can reward deposits", async function () {
    const { oracle, user, gbc, rm } = await deployFixture();

    const depositId = ethers.encodeBytes32String("deposit-1");
    const amount = ethers.parseUnits("10", 18);

    await expect(
      rm.connect(oracle).rewardDeposit(user.address, amount, depositId)
    )
      .to.emit(rm, "RewardIssued")
      .withArgs(user.address, amount, depositId);

    expect(await gbc.balanceOf(user.address)).to.equal(amount);
  });

  it("reverts for non-oracle callers", async function () {
    const { user, rm } = await deployFixture();
    const depositId = ethers.encodeBytes32String("deposit-2");
    const amount = ethers.parseUnits("5", 18);

    await expect(
      rm.connect(user).rewardDeposit(user.address, amount, depositId)
    ).to.be.reverted;
  });
});
