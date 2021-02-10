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

  let SwapExactETHForTokens;
  let hardhatSwapExactETHForTokens;
  let owner;
  let acc1;
  let acc2;
  let accs;
  let daiContract;
  let daiDecimals;

  before(async function () {
    [owner, acc1, acc2, ...accs] = await ethers.getSigners();

    daiContract = new ethers.Contract(
      DAI_TOKEN_ADDRESS,
      daiAbi,
      ethers.provider
    );
    daiDecimals = await daiContract.decimals();

    SwapExactETHForTokens = await ethers.getContractFactory(
      "SwapExactETHForTokens"
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      expect(await hardhatSwapExactETHForTokens.signer.address).to.equal(
        owner.address
      );
    });

    it("Should fail if invalid recipient address is passed", async function () {
      try {
        await SwapExactETHForTokens.deploy(
          UNISWAP_ROUTER_ADDRESS,
          DAI_TOKEN_ADDRESS,
          0,
          acc1.address,
          10
        );
      } catch (e) {
        expect(e).instanceOf(Error);
      }
    });

    it("Should fail if invalid percentage is passed", async function () {
      await expect(
        SwapExactETHForTokens.deploy(
          UNISWAP_ROUTER_ADDRESS,
          DAI_TOKEN_ADDRESS,
          owner.address,
          acc1.address,
          101
        )
      ).to.be.revertedWith("revert invalid percentage value");
      try {
        await SwapExactETHForTokens.deploy(
          UNISWAP_ROUTER_ADDRESS,
          DAI_TOKEN_ADDRESS,
          owner.address,
          acc1.address,
          -1
        );
      } catch (e) {
        expect(e).instanceOf(Error);
      }
    });
  });

  describe("Transactions", function () {
    it("Should swap exact ETH for tokens", async function () {
      expect(await daiContract.balanceOf(owner.address)).to.equal(0);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "5.0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };
      await acc2.sendTransaction(tx);

      const provider = await ethers.getDefaultProvider();
      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);

      const toDai = await daiContract.balanceOf(
        hardhatSwapExactETHForTokens.address
      );
      const toDaiRecipient = await daiContract.balanceOf(owner.address);
      const toDaiExchange = await daiContract.balanceOf(acc1.address);
      console.log(
        `🚀 ${fromEther} ETH -> ${ethers.utils.formatEther(
          toDaiRecipient
        )} + ${ethers.utils.formatEther(toDaiExchange)} DAI`
      );
      expect(toDai).to.equal(0);
      expect(toDaiRecipient).to.be.above(0);
      expect(toDaiExchange).to.be.above(0);

      // await hardhatSwapExactETHForTokens.swapExactETHForTokens(owner.address, {
      //   value: ethers.utils.parseEther("5"),
      // });
    });
  });
});
