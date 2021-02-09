const { expect } = require("chai");

describe("SwapExactETHForTokens contract", function () {
  const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const DAI_TOKEN_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const daiAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address owner) external view returns (uint)",
    "function decimals() external view returns (uint8)",
  ];

  let hardhatSwapExactETHForTokens;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let daiContract;
  let daiDecimals;

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const SwapExactETHForTokens = await ethers.getContractFactory(
      "SwapExactETHForTokens"
    );
    hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
      UNISWAP_ROUTER_ADDRESS,
      DAI_TOKEN_ADDRESS,
      owner.address
    );
    await hardhatSwapExactETHForTokens.deployed();

    daiContract = new ethers.Contract(
      DAI_TOKEN_ADDRESS,
      daiAbi,
      ethers.provider
    );
    daiDecimals = await daiContract.decimals();
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
      expect(await daiContract.balanceOf(owner.address)).to.equal(0);

      const fromEther = "5.0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };
      await addr1.sendTransaction(tx);

      const toDai = await daiContract.balanceOf(owner.address);
      console.log(
        `🚀 ${fromEther} ETH -> ${ethers.utils.formatEther(toDai)} DAI`
      );
      expect(toDai).to.be.above(0);

      // await hardhatSwapExactETHForTokens.swapExactETHForTokens(addr1.address, {
      //   value: ethers.utils.parseEther("5"),
      // });
    });
  });
});
