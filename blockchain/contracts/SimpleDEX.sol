// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDEX is ReentrancyGuard, Ownable {
    IERC20 public token;
    uint256 public rate; // Number of tokens per 1 ETH

    event Bought(address indexed buyer, uint256 amount);
    event Sold(address indexed seller, uint256 amount);

    constructor(address _token, uint256 _rate) {
        token = IERC20(_token);
        rate = _rate;
    }

    function buyGBC() external payable nonReentrant {
        uint256 amountToBuy = msg.value * rate;
        require(amountToBuy > 0, "You need to send some ETH");
        require(token.balanceOf(address(this)) >= amountToBuy, "Not enough tokens in the reserve");

        token.transfer(msg.sender, amountToBuy);
        emit Bought(msg.sender, amountToBuy);
    }

    function sellGBC(uint256 amount) external nonReentrant {
        require(amount > 0, "You need to sell at least some tokens");
        uint256 allow = token.allowance(msg.sender, address(this));
        require(allow >= amount, "Check the token allowance");

        uint256 etherAmount = amount / rate;
        require(address(this).balance >= etherAmount, "Not enough ETH in the reserve");

        token.transferFrom(msg.sender, address(this), amount);
        payable(msg.sender).transfer(etherAmount);

        emit Sold(msg.sender, amount);
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        token.transfer(msg.sender, amount);
    }
}
