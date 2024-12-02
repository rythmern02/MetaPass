// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract RewardsManager is Ownable(msg.sender) {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Perk {
        string description;
        bool isActive;
    }

    mapping(uint256 => Perk) public perks;
    uint256 public nextPerkId;

    mapping(uint256 => EnumerableSet.AddressSet) private perkHolders;

    event PerkAdded(uint256 indexed perkId, string description);
    event PerkAssigned(uint256 indexed perkId, address indexed holder);
    event PerkRevoked(uint256 indexed perkId, address indexed holder);

    function addPerk(string memory description) external onlyOwner {
        perks[nextPerkId] = Perk(description, true);
        emit PerkAdded(nextPerkId, description);
        nextPerkId++;
    }

    function assignPerk(uint256 perkId, address holder) external onlyOwner {
        require(perks[perkId].isActive, "Perk not active");
        perkHolders[perkId].add(holder);
        emit PerkAssigned(perkId, holder);
    }

    function revokePerk(uint256 perkId, address holder) external onlyOwner {
        perkHolders[perkId].remove(holder);
        emit PerkRevoked(perkId, holder);
    }

    function getPerkHolders(uint256 perkId) external view returns (address[] memory) {
        return perkHolders[perkId].values();
    }
}
