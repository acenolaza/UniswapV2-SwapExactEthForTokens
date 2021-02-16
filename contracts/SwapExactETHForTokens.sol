// SPDX-License-Identifier: ISC
pragma solidity 0.7.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

contract SwapExactETHForTokens is Ownable {
    IUniswapV2Router01 private uniswapRouter;
    address private token;
    address private recipient;
    address private exchange;
    uint8 private exchangePercentage;

    event ETHSwapped(uint256[] amounts);

    constructor(
        address _uniswapRouter,
        address _token,
        address _recipient,
        address _exchange,
        uint8 _exchangePercentage
    ) Ownable() {
        require(_recipient != address(0), "invalid recipient address");
        require(_exchangePercentage <= 100, "invalid percentage value");

        uniswapRouter = IUniswapV2Router01(_uniswapRouter);
        token = _token;
        recipient = _recipient;
        exchange = _exchange;
        exchangePercentage = _exchangePercentage;
    }

    function getRecipient() external view returns (address) {
        return recipient;
    }

    function setRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "invalid recipient address");
        recipient = _recipient;
    }

    function getExchange() external view returns (address) {
        return exchange;
    }

    function setExchange(address _exchange) external onlyOwner {
        exchange = _exchange;
    }

    function getExchangePercentage() external view returns (uint8) {
        return exchangePercentage;
    }

    function setExchangePercentage(uint8 _exchangePercentage)
        external
        onlyOwner
    {
        require(_exchangePercentage <= 100, "invalid percentage value");
        exchangePercentage = _exchangePercentage;
    }

    function swapExactETHForTokensOnUniswap(
        address _token,
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
        uint256[] memory amounts =
            uniswapRouter.swapExactETHForTokens{value: _amountIn}(
                amountOutMin,
                path,
                address(this),
                _deadline
            );

        emit ETHSwapped(amounts);
    }

    function percentageOf(uint256 _amount, uint256 _basisPoints)
        internal
        pure
        returns (uint256)
    {
        return (_amount * _basisPoints) / 10000;
    }

    // important to receive ETH
    receive() external payable {
        // unix timestamp after which the transaction will revert
        uint256 deadline = block.timestamp + 600; // transaction expires in 600 seconds (10 minutes)
        swapExactETHForTokensOnUniswap(token, msg.value, 0, deadline);

        IERC20 tokenContract = IERC20(token);
        uint256 tokenBalance = tokenContract.balanceOf(address(this));
        if (exchange != address(0) && exchangePercentage > 0) {
            uint256 exchangeAmount =
                percentageOf(tokenBalance, uint256(exchangePercentage) * 100);
            require(
                tokenContract.transfer(
                    recipient,
                    tokenBalance - exchangeAmount
                ),
                "transfer failed."
            );
            require(
                tokenContract.transfer(exchange, exchangeAmount),
                "transfer failed."
            );
        } else {
            require(
                tokenContract.transfer(recipient, tokenBalance),
                "transfer failed."
            );
        }
    }

    // sends ETH balance to msg.sender
    function withdrawEthers() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    // sends token balance to msg.sender
    function withdrawTokens(address _token) external onlyOwner {
        IERC20 tokenContract = IERC20(_token);
        uint256 tokenBalance = tokenContract.balanceOf(address(this));
        require(
            tokenContract.transfer(msg.sender, tokenBalance),
            "transfer failed."
        );
    }
}
