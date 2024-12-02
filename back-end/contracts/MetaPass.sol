// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MembershipNFT is ERC721URIStorage, Ownable(msg.sender), ReentrancyGuard {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public tierBenefits; // Mapping from tokenId to tier
    mapping(address => bool) public approvedUpdaters;

    event MetadataUpdated(uint256 indexed tokenId, string newTokenURI);
    event TierUpdated(uint256 indexed tokenId, uint256 newTier);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    modifier onlyApprovedUpdater() {
        require(approvedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function mint(address to, string memory tokenURI, uint256 tier) external onlyOwner nonReentrant {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);                                                                                                          
        _setTokenURI(tokenId, tokenURI);
        tierBenefits[tokenId] = tier;
        nextTokenId++;
    }

function updateMetadata(uint256 tokenId, string memory newTokenURI) external onlyApprovedUpdater {
    _setTokenURI(tokenId, newTokenURI);
    emit MetadataUpdated(tokenId, newTokenURI);
}

function updateTier(uint256 tokenId, uint256 newTier) external onlyApprovedUpdater {
    tierBenefits[tokenId] = newTier;
    emit TierUpdated(tokenId, newTier);
}

    function approveUpdater(address updater, bool status) external onlyOwner {
        approvedUpdaters[updater] = status;
    }
}
