const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const DAI_TOKEN_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

const ROPSTEN_UNISWAP_ROUTER_ADDRESS =
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const ROPSTEN_DAI_TOKEN_ADDRESS = "0xaD6D458402F60fD3Bd25163575031ACDce07538D";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: ", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const SwapExactETHForTokens = await ethers.getContractFactory(
    "SwapExactETHForTokens"
  );
  hardhatSwapExactETHForTokens = await SwapExactETHForTokens.deploy(
    ROPSTEN_UNISWAP_ROUTER_ADDRESS,
    ROPSTEN_DAI_TOKEN_ADDRESS,
    deployer.address, // recipient address
    "0x19391A94a4d99a7083e3D561E4ff96528BA8E2b7", // exchange address
    25 // exchange percentage
  );
  await hardhatSwapExactETHForTokens.deployed();

  console.log(
    "SwapExactETHForTokens address:",
    hardhatSwapExactETHForTokens.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
