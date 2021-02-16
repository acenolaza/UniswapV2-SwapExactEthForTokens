require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(
      `${account.address}:${ethers.utils.formatEther(
        await account.getBalance()
      )}ETH`
    );
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const provider = new ethers.providers.JsonRpcProvider();
    // const account = ethers.utils.getAddress(taskArgs.account);
    // const balance = await provider.getBalance(account);
    const account = await provider.getSigner(taskArgs.account);

    console.log(ethers.utils.formatEther(await account.getBalance()), "ETH");
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.ALCHEMY_MAINNET_RPC_URL}${process.env.ALCHEMY_API_KEY}`,
        // blockNumber: 11758978,
      },
      // loggingEnabled: true,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`],
    },
    // rinkeby: {
    //   url: "https://rinkeby.infura.io/v3/123abc123abc123abc123abc123abcde",
    //   accounts: [privateKey1, privateKey2, ...]
    // }
  },
  solidity: {
    version: "0.7.4",
    // settings: {
    //   optimizer: {
    //     enabled: true,
    //     runs: 200,
    //   },
    // },
  },
  // paths: {
  //   sources: "./contracts",
  //   tests: "./test",
  //   cache: "./cache",
  //   artifacts: "./artifacts",
  // },
  mocha: {
    timeout: 20000,
  },
};
