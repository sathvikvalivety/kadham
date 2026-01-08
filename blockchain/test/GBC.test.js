const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GarbageBlockchainCoin", function () {
  async function deployFixture() {
    const [admin, other] = await ethers.getSigners();
    const GBC = await ethers.getContractFactory("GarbageBlockchainCoin");
    const gbc = await GBC.deploy(admin.address);
    await gbc.waitForDeployment();
    return { gbc, admin, other };
  }

  it("assigns admin roles on deployment", async function () {
    const { gbc, admin } = await deployFixture();
    const DEFAULT_ADMIN_ROLE = await gbc.DEFAULT_ADMIN_ROLE();
    const PAUSER_ROLE = await gbc.PAUSER_ROLE();

    expect(await gbc.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await gbc.hasRole(PAUSER_ROLE, admin.address)).to.equal(true);
  });

  it("only minter can mint", async function () {
    const { gbc, admin, other } = await deployFixture();
    const MINTER_ROLE = await gbc.MINTER_ROLE();

    await gbc.grantRole(MINTER_ROLE, admin.address);
    await expect(gbc.connect(admin).mint(other.address, 100)).to.emit(gbc, "Transfer");

    await expect(gbc.connect(other).mint(other.address, 100)).to.be.reverted;
  });

  it("pauses transfers and minting", async function () {
    const { gbc, admin, other } = await deployFixture();
    const PAUSER_ROLE = await gbc.PAUSER_ROLE();
    const MINTER_ROLE = await gbc.MINTER_ROLE();

    await gbc.grantRole(MINTER_ROLE, admin.address);
    await gbc.grantRole(PAUSER_ROLE, admin.address);

    await gbc.connect(admin).mint(other.address, 100);
    await gbc.connect(admin).pause();

    await expect(gbc.connect(admin).mint(other.address, 100)).to.be.reverted;
    await expect(gbc.connect(other).transfer(admin.address, 10)).to.be.reverted;
  });
});
