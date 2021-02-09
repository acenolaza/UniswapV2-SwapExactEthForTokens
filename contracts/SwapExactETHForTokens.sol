// SPDX-License-Identifier: ISC
pragma solidity 0.7.4;

// import "hardhat/console.sol";

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
    IUniswapV2Router01 public uniswapRouter;

    address private owner;
    address private token;
    address private recepient;

    constructor(
        address _uniswapRouter,
        address _token,
        address _recepient
    ) {
        owner = msg.sender;

        uniswapRouter = IUniswapV2Router01(_uniswapRouter);

        token = _token;
        recepient = _recepient;
    }

    function swapExactETHForTokensOnUniswap(
        address _token,
        address _to,
        uint256 _amountIn,
        uint256 _amountOutMin,
        uint256 _deadline
    ) internal {
        require(_amountIn > 0, "insufficient eth value");

        // create exchange path
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = _token;

        // set the minimum amount of output tokens that must be received for the transaction not to revert
        // if _amountOutMin is less or equal to 0 calculate it with getAmountsOut()
        uint256 amountOutMin;
        if (_amountOutMin <= 0) {
            amountOutMin = uniswapRouter.getAmountsOut(_amountIn, path)[1];
        } else {
            amountOutMin = _amountOutMin;
        }

        // swap ETH for token
        //uint256[] memory amounts =
        uniswapRouter.swapExactETHForTokens{value: _amountIn}(
            amountOutMin,
            path,
            _to,
            _deadline
        );
        // TODO: publish event?

        // console.log("Leftover: %s", address(this).balance);
    }

    // important to receive ETH
    receive() external payable {
        // unix timestamp after which the transaction will revert
        uint256 deadline = block.timestamp + 600; // transaction expires in 600 seconds (10 minutes)
        swapExactETHForTokensOnUniswap(
            token,
            recepient,
            msg.value,
            0,
            deadline
        );
    }

    function withdraw() external {
        require(msg.sender == owner, "msg.sender must be the owner");
        msg.sender.transfer(address(this).balance);
    }
}
