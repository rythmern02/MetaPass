// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        address nftContract;
        uint256 tokenId;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;
    uint256 public platformFee = 250; // 2.5% fee
    address public feeRecipient;

    event Listed(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Purchased(uint256 indexed listingId, address indexed buyer, address seller, uint256 price);
    event Cancelled(uint256 indexed listingId);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    function listNFT(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Approval missing");

        listings[nextListingId] = Listing(msg.sender, price, nftContract, tokenId);
        emit Listed(nextListingId, msg.sender, nftContract, tokenId, price);
        nextListingId++;
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing memory listing = listings[listingId];
        require(listing.price > 0, "Listing does not exist");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - fee;

        payable(feeRecipient).transfer(fee);
        payable(listing.seller).transfer(sellerAmount);

        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        emit Purchased(listingId, msg.sender, listing.seller, listing.price);

        delete listings[listingId];
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing memory listing = listings[listingId];
        require(listing.seller == msg.sender, "Not listing owner");

        delete listings[listingId];
        emit Cancelled(listingId);
    }

    function updatePlatformFee(uint256 newFee) external {
        require(msg.sender == feeRecipient, "Not fee recipient");
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
}
