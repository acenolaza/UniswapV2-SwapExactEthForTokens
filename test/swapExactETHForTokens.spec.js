const {expect} = require("chai");

describe("SwapExactETHForTokens contract", function () {
  let SwapExactETHForTokens;
  let hardhatSwapExactETHForTokens;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    SwapExactETHForTokens = await ethers.getContractFactory(
      "SwapExactETHForTokens"
    );
    hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy();
    await hardhatSwapExactETHForTokens.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatSwapExactETHForTokens.signer.address).to.equal(
        owner.address
      );
    });

    // it("Should assign the total supply of tokens to the owner", async function () {
    //   const ownerBalance = await hardhatToken.balanceOf(owner.address);
    //   expect(await hardhatSwapExactETHForTokens.totalSupply()).to.equal(ownerBalance);
    // });
  });

  describe("Transactions", function () {
    it("Should swap exact ETH for tokens", async function () {
      await hardhatSwapExactETHForTokens.swapExactETHForTokens(addr1.address, {
        value: ethers.utils.parseEther("5"),
      });
    });
  });
});
