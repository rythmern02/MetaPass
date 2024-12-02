// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RentalContract is ReentrancyGuard {
    struct Rental {
        address owner;
        address renter;
        uint256 tokenId;
        uint256 endTime;
    }

    mapping(address => mapping(uint256 => Rental)) public rentals; // NFT contract -> tokenId -> rental

    event Rented(address indexed nftContract, uint256 indexed tokenId, address owner, address renter, uint256 duration);
    event Returned(address indexed nftContract, uint256 indexed tokenId);

    function rentNFT(
        address nftContract,
        uint256 tokenId,
        uint256 duration // Duration in seconds
    ) external payable nonReentrant {
        IERC721 nft = IERC721(nftContract);
        address owner = nft.ownerOf(tokenId);
        require(owner != address(0), "Invalid token");
        require(owner != msg.sender, "Owner cannot rent their own NFT");

        rentals[nftContract][tokenId] = Rental({
            owner: owner,
            renter: msg.sender,
            tokenId: tokenId,
            endTime: block.timestamp + duration
        });

        nft.transferFrom(owner, address(this), tokenId);
        emit Rented(nftContract, tokenId, owner, msg.sender, duration);
    }

    function returnNFT(address nftContract, uint256 tokenId) external nonReentrant {
        Rental memory rental = rentals[nftContract][tokenId];
        require(block.timestamp >= rental.endTime, "Rental period not yet ended");
        require(rental.renter != address(0), "Token not rented");

        IERC721(nftContract).transferFrom(address(this), rental.owner, tokenId);
        delete rentals[nftContract][tokenId];
        emit Returned(nftContract, tokenId);
    }
}
