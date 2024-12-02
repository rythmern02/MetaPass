// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentGateway is ReentrancyGuard {
    address public platformWallet;
    uint256 public platformFee; // Fee in basis points (e.g., 250 = 2.5%)

    mapping(address => bool) public supportedStablecoins;

    event PaymentProcessed(address indexed payer, uint256 amount, uint256 royalty, uint256 platformShare);
    event StablecoinAdded(address stablecoin);
    event StablecoinRemoved(address stablecoin);

    constructor(address _platformWallet, uint256 _platformFee) {
        require(_platformFee <= 1000, "Fee too high"); // Max 10%
        platformWallet = _platformWallet;
        platformFee = _platformFee;
    }

    function processPayment(
        address seller,
        address stablecoin,
        uint256 amount,
        uint256 royaltyPercentage, // Royalty as basis points
        address royaltyRecipient
    ) external payable nonReentrant {
        require(amount > 0, "Invalid amount");
        require(seller != address(0), "Invalid seller address");
        require(stablecoin == address(0) || supportedStablecoins[stablecoin], "Stablecoin not supported");

        uint256 platformShare = (amount * platformFee) / 10000;
        uint256 royaltyShare = (amount * royaltyPercentage) / 10000;
        uint256 sellerShare = amount - platformShare - royaltyShare;

        if (stablecoin == address(0)) {
            // Native token payment
            require(msg.value == amount, "Incorrect value sent");
            payable(platformWallet).transfer(platformShare);
            payable(royaltyRecipient).transfer(royaltyShare);
            payable(seller).transfer(sellerShare);
        } else {
            // Stablecoin payment
            IERC20(stablecoin).transferFrom(msg.sender, platformWallet, platformShare);
            IERC20(stablecoin).transferFrom(msg.sender, royaltyRecipient, royaltyShare);
            IERC20(stablecoin).transferFrom(msg.sender, seller, sellerShare);
        }

        emit PaymentProcessed(msg.sender, amount, royaltyShare, platformShare);
    }

    function addStablecoin(address stablecoin) external {
        require(msg.sender == platformWallet, "Only platform wallet can add");
        supportedStablecoins[stablecoin] = true;
        emit StablecoinAdded(stablecoin);
    }

    function removeStablecoin(address stablecoin) external {
        require(msg.sender == platformWallet, "Only platform wallet can remove");
        supportedStablecoins[stablecoin] = false;
        emit StablecoinRemoved(stablecoin);
    }
}
