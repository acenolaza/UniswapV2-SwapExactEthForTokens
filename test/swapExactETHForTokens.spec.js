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

  let provider;
  let owner;
  let acc1;
  let acc2;
  let accs;
  let SwapExactETHForTokens;
  let hardhatSwapExactETHForTokens;

  before(async function () {
    provider = await ethers.getDefaultProvider();

    [owner, acc1, acc2, ...accs] = await ethers.getSigners();

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
    let daiContract;
    let daiDecimals;

    before(async function () {
      daiContract = new ethers.Contract(
        DAI_TOKEN_ADDRESS,
        daiAbi,
        ethers.provider
      );
      daiDecimals = await daiContract.decimals();
    });

    it("Should swap exact ETH for tokens and send all to owner", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        "0x0000000000000000000000000000000000000000",
        0
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "5.0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };
      await acc2.sendTransaction(tx);

      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);

      const daiInContract = await daiContract.balanceOf(
        hardhatSwapExactETHForTokens.address
      );
      const recipientDai = await daiContract.balanceOf(owner.address);
      const exchangeDai = await daiContract.balanceOf(acc1.address);

      console.log(
        `🚀 ${fromEther} ETH -> 
        ${ethers.utils.formatEther(recipientDai.sub(ownerIntialDAIBalance))} + 
        ${ethers.utils.formatEther(exchangeDai.sub(acc1IntialDAIBalance))} DAI`
      );

      expect(await acc2.getBalance()).to.be.below(acc2InitialETHBalance);
      expect(daiInContract).to.equal(0);
      expect(recipientDai).to.be.above(ownerIntialDAIBalance);
      expect(exchangeDai).to.be.equal(acc1IntialDAIBalance);
    });

    it("Should swap exact ETH for tokens and send all to exchange", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        100
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "5";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };
      await acc2.sendTransaction(tx);

      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);

      const daiInContract = await daiContract.balanceOf(
        hardhatSwapExactETHForTokens.address
      );
      const recipientDai = await daiContract.balanceOf(owner.address);
      const exchangeDai = await daiContract.balanceOf(acc1.address);

      console.log(
        `🚀 ${fromEther} ETH -> 
        ${ethers.utils.formatEther(recipientDai.sub(ownerIntialDAIBalance))} + 
        ${ethers.utils.formatEther(exchangeDai.sub(acc1IntialDAIBalance))} DAI`
      );

      expect(await acc2.getBalance()).to.be.below(acc2InitialETHBalance);
      expect(daiInContract).to.equal(0);
      expect(recipientDai).to.be.equal(ownerIntialDAIBalance);
      expect(exchangeDai).to.be.above(acc1IntialDAIBalance);
    });

    it("Should swap exact ETH for tokens and split payment based on percentage", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "5";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };
      await acc2.sendTransaction(tx);

      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);

      const daiInContract = await daiContract.balanceOf(
        hardhatSwapExactETHForTokens.address
      );
      const recipientDai = await daiContract.balanceOf(owner.address);
      const exchangeDai = await daiContract.balanceOf(acc1.address);

      console.log(
        `🚀 ${fromEther} ETH -> 
        ${ethers.utils.formatEther(recipientDai.sub(ownerIntialDAIBalance))} + 
        ${ethers.utils.formatEther(exchangeDai.sub(acc1IntialDAIBalance))} DAI`
      );

      expect(await acc2.getBalance()).to.be.below(acc2InitialETHBalance);
      expect(daiInContract).to.equal(0);
      expect(recipientDai).to.be.above(ownerIntialDAIBalance);
      expect(exchangeDai).to.be.above(acc1IntialDAIBalance);
    });

    it("Should fail when not sending enough ETH", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };

      await expect(acc2.sendTransaction(tx)).to.be.revertedWith(
        "revert insufficient eth value"
      );

      expect(await acc2.getBalance()).to.be.equal(acc2InitialETHBalance);
      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);
      expect(await daiContract.balanceOf(owner.address)).to.equal(
        ownerIntialDAIBalance
      );
      expect(await daiContract.balanceOf(acc1.address)).to.equal(
        acc1IntialDAIBalance
      );
    });

    it("Should fail when setting a wrong address for uniswap router", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        "0xcac88aad4da93e9f6d0d57f3dbcadc887cb71e39",
        DAI_TOKEN_ADDRESS,
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };

      await expect(acc2.sendTransaction(tx)).to.be.reverted;

      expect(await acc2.getBalance()).to.be.equal(acc2InitialETHBalance);
      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);
      expect(await daiContract.balanceOf(owner.address)).to.equal(
        ownerIntialDAIBalance
      );
      expect(await daiContract.balanceOf(acc1.address)).to.equal(
        acc1IntialDAIBalance
      );
    });

    it("Should fail when setting a wrong address for token", async function () {
      const acc2InitialETHBalance = await acc2.getBalance();
      const ownerIntialDAIBalance = await daiContract.balanceOf(owner.address);
      const acc1IntialDAIBalance = await daiContract.balanceOf(acc1.address);

      hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
        UNISWAP_ROUTER_ADDRESS,
        "0xcac88aad4da93e9f6d0d57f3dbcadc887cb71e39",
        owner.address,
        acc1.address,
        25
      );
      await hardhatSwapExactETHForTokens.deployed();

      const fromEther = "0";
      tx = {
        to: hardhatSwapExactETHForTokens.address,
        value: ethers.utils.parseEther(fromEther),
      };

      await expect(acc2.sendTransaction(tx)).to.be.reverted;

      expect(await acc2.getBalance()).to.be.equal(acc2InitialETHBalance);
      expect(
        await provider.getBalance(hardhatSwapExactETHForTokens.address)
      ).to.equal(0);
      expect(await daiContract.balanceOf(owner.address)).to.equal(
        ownerIntialDAIBalance
      );
      expect(await daiContract.balanceOf(acc1.address)).to.equal(
        acc1IntialDAIBalance
      );
    });
  });
});
