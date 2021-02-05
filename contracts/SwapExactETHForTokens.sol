pragma solidity ^0.7.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface IUniswapV2Router01 {
    function WETH() external pure returns (address);

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

contract SwapExactETHForTokens {
    address internal constant UNISWAP_ROUTER_ADDRESS =
        address(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    address internal constant DAI_TOKEN_ADDRESS =
        address(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    IUniswapV2Router01 public uniswapRouter;
    IERC20 private daiToken;

    constructor() {
        uniswapRouter = IUniswapV2Router01(UNISWAP_ROUTER_ADDRESS);
        daiToken = IERC20(DAI_TOKEN_ADDRESS);
    }

    function swapExactETHForTokens(address _to) public payable {
        console.log("address(this):", address(this));
        console.log("wallet:", msg.sender);
        console.log(
            "token balance of %s before swap: %s",
            _to,
            daiToken.balanceOf(_to) / (1 ether)
        );

        // create exchange path
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = DAI_TOKEN_ADDRESS;

        uint256 amountOutMin = uniswapRouter.getAmountsOut(msg.value, path)[1];

        uint256 deadline = block.timestamp + 15; // using 'now' for convenience, for mainnet pass deadline from frontend!

        // swap ETH for token
        uint256[] memory amounts =
            uniswapRouter.swapExactETHForTokens{value: msg.value}(
                amountOutMin,
                path,
                _to,
                deadline
            );

        console.log(
            "token balance of %s after swap: %s",
            _to,
            daiToken.balanceOf(_to) / (1 ether)
        );

        // return eth to account
        // address(msg.sender).transfer(msg.value);
    }

    // important to receive ETH
    receive() external payable {}
}
