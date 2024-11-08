// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NftStaker is Ownable(msg.sender), IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeERC20 for IERC20;

    // Constants
    address public constant DEFAULT_REWARD_TOKEN =
        0xda3828E745a2B1D74FBbd1Df202557A60Dd2F11b; // Default reward token
    uint256 public constant MIN_STAKE_DURATION = 60 days; // Minimum staking duration of 2 months

    // Configurable variables (can be updated by the owner)
    uint256 public pointsPerDay = 10; // Points earned per day per NFT
    uint256 public rewardTokensPerNftStaked = 1 * 10 ** 18; // Reward tokens per NFT staked (with 18 decimals)
    uint256 public maxNftsPerUser = 10; // Maximum number of NFTs a user can stake
    uint256 public collectionFee = 0.0001 ether; // Fee for adding a collection

    // Structs for storing information
    struct CollectionInfo {
        address nftAddress; // Address of the NFT collection
        address rewardToken; // Address of the reward token associated with this collection
    }

    struct UserInfo {
        mapping(address => EnumerableSet.UintSet) stakedNfts; // Mapping of staked NFTs per collection
        uint256 earnedPoints; // Total points earned by the user
        uint256 claimedPoints; // Total points claimed by the user
        uint256 lastStakedTime; // Timestamp of the last staking event
        uint256 earnedRewards; // Total rewards earned by the user
        uint256 claimedRewards; // Total rewards claimed by the user
    }

    struct CollectionTokens {
        address contractAddress; // Address of the NFT contract
        uint256[] tokenIds; // List of token IDs staked in the collection
    }

    // Mappings for user information and collections
    mapping(address => UserInfo) private userInfo;
    mapping(address => CollectionInfo) public nftCollections;

    // Set to store collection addresses
    EnumerableSet.AddressSet private collectionAddresses;

    // Events
    event CollectionAdded(
        address indexed nftAddress,
        address indexed rewardToken
    );
    event RewardTokenUpdated(
        address indexed nftAddress,
        address indexed oldToken,
        address indexed newToken
    );
    event PointsPerDayUpdated(uint256 oldPointsPerDay, uint256 newPointsPerDay);
    event RewardTokensPerNftStakedUpdated(
        uint256 oldRewardTokens,
        uint256 newRewardTokens
    );
    event MaxNftsPerUserUpdated(uint256 oldLimit, uint256 newLimit);
    event Staked(
        address indexed account,
        address indexed nftAddress,
        uint256 tokenId
    );
    event Withdrawn(
        address indexed account,
        address indexed nftAddress,
        uint256 tokenId
    );
    event Harvested(address indexed account, uint256 amount);
    event InsufficientRewardToken(
        address indexed account,
        uint256 amountNeeded,
        uint256 balance
    );
    event PointsClaimed(address indexed account, uint256 points);
    event CollectionFeeUpdated(uint256 oldFee, uint256 newFee);
    event RewardTokenSent(
        address indexed nftAddress,
        address indexed rewardToken,
        uint256 amount
    );
    event RewardTokenWithdrawn(
        address indexed nftAddress,
        address indexed rewardToken,
        uint256 amount
    );

    // Constructor
    constructor() {}

    // External and public functions

    /**
     * @dev Adds a new NFT collection to the staking platform.
     * @param _nftAddress The address of the NFT collection.
     * @param _rewardToken The address of the reward token associated with this collection.
     */
    function addCollection(
        address _nftAddress,
        address _rewardToken
    ) external payable {
        require(msg.value >= collectionFee, "Insufficient fee sent");
        require(_nftAddress != address(0), "Invalid NFT address");
        require(_rewardToken != address(0), "Invalid reward token address");

        CollectionInfo storage collection = nftCollections[_nftAddress];
        require(
            collection.nftAddress == address(0),
            "Collection already exists"
        );

        nftCollections[_nftAddress] = CollectionInfo({
            nftAddress: _nftAddress,
            rewardToken: _rewardToken
        });

        collectionAddresses.add(_nftAddress);

        emit CollectionAdded(_nftAddress, _rewardToken);
    }

    /**
     * @dev Updates the reward token for a specific NFT collection.
     * @param _nftAddress The address of the NFT collection.
     * @param _rewardToken The new reward token address.
     */
    function updateRewardToken(
        address _nftAddress,
        address _rewardToken
    ) external onlyOwner {
        require(_rewardToken != address(0), "Invalid reward token address");
        CollectionInfo storage collection = nftCollections[_nftAddress];
        require(collection.nftAddress != address(0), "Collection not found");

        emit RewardTokenUpdated(
            _nftAddress,
            collection.rewardToken,
            _rewardToken
        );
        collection.rewardToken = _rewardToken;
    }

    /**
     * @dev Updates the points per day earned per NFT staked.
     * @param _pointsPerDay The new points per day value.
     */
    function updatePointsPerDay(uint256 _pointsPerDay) external onlyOwner {
        require(_pointsPerDay > 0, "Invalid points value");
        emit PointsPerDayUpdated(pointsPerDay, _pointsPerDay);
        pointsPerDay = _pointsPerDay;
    }

    /**
     * @dev Updates the reward tokens per NFT staked.
     * @param _rewardTokensPerNftStaked The new reward tokens value per NFT staked.
     */
    function updateRewardTokensPerNftStaked(
        uint256 _rewardTokensPerNftStaked
    ) external onlyOwner {
        require(_rewardTokensPerNftStaked > 0, "Invalid reward tokens value");
        emit RewardTokensPerNftStakedUpdated(
            rewardTokensPerNftStaked,
            _rewardTokensPerNftStaked
        );
        rewardTokensPerNftStaked = _rewardTokensPerNftStaked;
    }

    /**
     * @dev Updates the maximum number of NFTs a user can stake.
     * @param _maxLimit The new maximum limit.
     */
    function updateMaxNftsPerUser(uint256 _maxLimit) external onlyOwner {
        require(_maxLimit > 0, "Invalid limit value");
        emit MaxNftsPerUserUpdated(maxNftsPerUser, _maxLimit);
        maxNftsPerUser = _maxLimit;
    }

    /**
     * @dev Stakes a list of NFTs from a specific collection.
     * @param _nftAddress The address of the NFT collection.
     * @param tokenIdList The list of token IDs to stake.
     */
    function stake(address _nftAddress, uint256[] memory tokenIdList) external {
        require(
            collectionAddresses.contains(_nftAddress),
            "Collection not approved for staking"
        );
        require(
            userInfo[msg.sender].stakedNfts[_nftAddress].length() +
                tokenIdList.length <=
                maxNftsPerUser,
            "Exceeds the max limit per user"
        );

        UserInfo storage user = userInfo[msg.sender];

        // Update earned points and rewards before staking new NFTs
        user.earnedPoints += calculatePendingPoints(msg.sender);

        for (uint256 i = 0; i < tokenIdList.length; i++) {
            IERC721(_nftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenIdList[i]
            );
            user.stakedNfts[_nftAddress].add(tokenIdList[i]);
            emit Staked(msg.sender, _nftAddress, tokenIdList[i]);
        }
        user.lastStakedTime = block.timestamp;

        // Update earned rewards based on new earned points
        user.earnedRewards = calculateEarnedRewards(user.earnedPoints);
    }

    /**
     * @dev Withdraws a list of staked NFTs from a specific collection.
     * @param _nftAddress The address of the NFT collection.
     * @param tokenIdList The list of token IDs to withdraw.
     */
    function withdraw(
        address _nftAddress,
        uint256[] memory tokenIdList
    ) external {
        UserInfo storage user = userInfo[msg.sender];
        require(
            user.stakedNfts[_nftAddress].length() >= tokenIdList.length,
            "Not enough staked NFTs"
        );
        // Calculate the staked duration
        uint256 stakedDuration = block.timestamp - user.lastStakedTime;

        // Ensure the staking duration meets the minimum requirement
        require(
            stakedDuration >= MIN_STAKE_DURATION,
            "Cannot withdraw before the minimum staking duration of 60 days"
        );

        // Update earned points and rewards before withdrawal
        user.earnedPoints += calculatePendingPoints(msg.sender);

        for (uint256 i = 0; i < tokenIdList.length; i++) {
            require(
                isStaked(msg.sender, _nftAddress, tokenIdList[i]),
                "NFT not staked"
            );

            user.stakedNfts[_nftAddress].remove(tokenIdList[i]);
            IERC721(_nftAddress).safeTransferFrom(
                address(this),
                msg.sender,
                tokenIdList[i]
            );

            emit Withdrawn(msg.sender, _nftAddress, tokenIdList[i]);
        }
        user.lastStakedTime = block.timestamp;

        // Update earned rewards based on remaining earned points
        user.earnedRewards = calculateEarnedRewards(user.earnedPoints);
    }

    /**
     * @dev Claims the accumulated reward tokens based on earned points.
     * @param _nftAddress The address of the NFT collection to harvest rewards from.
     */
    function harvest(address _nftAddress) external {
        address rewardToken = nftCollections[_nftAddress].rewardToken;
        UserInfo storage user = userInfo[msg.sender];

        // Calculate the points they haven't yet claimed
        uint256 pendingPoints = calculatePendingPoints(msg.sender);

        // Ensure they have claimed points before harvesting
        uint256 claimableRewards = calculateEarnedRewards(user.claimedPoints) -
            user.claimedRewards;

        require(claimableRewards > 0, "No new rewards to claim");

        require(
            IERC20(rewardToken).balanceOf(address(this)) >= claimableRewards,
            "Insufficient funds in treasury"
        );

        IERC20(rewardToken).safeTransfer(msg.sender, claimableRewards);

        // Update user state
        user.claimedRewards += claimableRewards;
        user.earnedPoints += pendingPoints;
        user.lastStakedTime = block.timestamp;

        emit Harvested(msg.sender, claimableRewards);
    }

    /**
     * @dev Claims the accumulated points. Points can only be claimed if the user has staked NFTs.
     */
    function claimPoints() external {
        UserInfo storage user = userInfo[msg.sender];

        // Ensure the user has staked NFTs before claiming points
        bool hasStakedNFTs = false;

        // Check all collections for staked NFTs
        for (uint256 i = 0; i < collectionAddresses.length(); i++) {
            address nftAddress = collectionAddresses.at(i);
            if (user.stakedNfts[nftAddress].length() > 0) {
                hasStakedNFTs = true;
                break;
            }
        }

        require(hasStakedNFTs, "No staked NFTs found.");

        // Calculate pending points
        uint256 pendingPoints = calculatePendingPoints(msg.sender);
        uint256 totalPoints = user.earnedPoints + pendingPoints;
        uint256 pointsToClaim = totalPoints - user.claimedPoints;

        require(pointsToClaim > 0, "No new points to claim");

        // Update user's points data
        user.claimedPoints += pointsToClaim;
        user.earnedPoints = totalPoints;
        user.lastStakedTime = block.timestamp;

        emit PointsClaimed(msg.sender, pointsToClaim);
    }

    /**
     * @dev Sends reward tokens to the contract for a specific NFT collection.
     * @param _nftAddress The address of the NFT collection.
     * @param _amount The amount of reward tokens to send.
     */
    function sendRewardToken(address _nftAddress, uint256 _amount) external {
        CollectionInfo storage collection = nftCollections[_nftAddress];
        require(collection.nftAddress != address(0), "Collection not found");

        IERC20 rewardToken = IERC20(collection.rewardToken);
        require(
            rewardToken.balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );

        rewardToken.safeTransferFrom(msg.sender, address(this), _amount);

        emit RewardTokenSent(_nftAddress, collection.rewardToken, _amount);
    }

    /**
     * @dev Withdraws reward tokens from the contract's treasury for a specific NFT collection.
     * @param _nftAddress The address of the NFT collection.
     * @param _amount The amount of reward tokens to withdraw.
     */
    function withdrawRewardTokens(
        address _nftAddress,
        uint256 _amount
    ) external onlyOwner {
        CollectionInfo storage collection = nftCollections[_nftAddress];
        require(collection.nftAddress != address(0), "Collection not found");
        require(_amount > 0, "Amount must be greater than zero");

        IERC20 rewardToken = IERC20(collection.rewardToken);
        rewardToken.safeTransfer(msg.sender, _amount);

        emit RewardTokenWithdrawn(_nftAddress, collection.rewardToken, _amount);
    }

    // View functions

    /**
     * @dev Returns the user's staking information.
     * @param _account The address of the user.
     * @return earnedPoints The total points earned by the user.
     * @return claimedPoints The total points claimed by the user.
     * @return lastStakedTime The last staking timestamp.
     * @return earnedRewards The total rewards earned by the user.
     * @return claimedRewards The total rewards claimed by the user.
     */
    function viewUserInfo(
        address _account
    )
        external
        view
        returns (
            uint256 earnedPoints,
            uint256 claimedPoints,
            uint256 lastStakedTime,
            uint256 earnedRewards,
            uint256 claimedRewards
        )
    {
        UserInfo storage user = userInfo[_account];
        earnedPoints = user.earnedPoints;
        claimedPoints = user.claimedPoints;
        lastStakedTime = user.lastStakedTime;
        earnedRewards = user.earnedRewards;
        claimedRewards = user.claimedRewards;
    }

    /**
     * @dev Checks if a specific NFT is staked by the user.
     * @param _account The address of the user.
     * @param _nftAddress The address of the NFT collection.
     * @param _tokenId The token ID of the NFT.
     * @return bool True if the NFT is staked, false otherwise.
     */
    function isStaked(
        address _account,
        address _nftAddress,
        uint256 _tokenId
    ) public view returns (bool) {
        UserInfo storage user = userInfo[_account];
        return user.stakedNfts[_nftAddress].contains(_tokenId);
    }

    /**
     * @dev Calculates the pending points for a user based on their staking time.
     * @param _account The address of the user.
     * @return uint256 The pending points.
     */
    /**
     * @dev Calculates the pending points for a user based on their staking time and the number of NFTs staked.
     * @param _account The address of the user.
     * @return uint256 The pending points.
     */
    function calculatePendingPoints(
        address _account
    ) public view returns (uint256) {
        UserInfo storage user = userInfo[_account];
        if (user.lastStakedTime == 0) {
            return 0;
        }

        // Calculate the number of days that have passed since the last staking time
        uint256 stakedDuration = block.timestamp - user.lastStakedTime;
        uint256 daysStaked = stakedDuration / 1 days;

        // Calculate the total number of NFTs staked across all collections
        uint256 totalNftsStaked = 0;
        for (uint256 i = 0; i < collectionAddresses.length(); i++) {
            address nftAddress = collectionAddresses.at(i);
            totalNftsStaked += user.stakedNfts[nftAddress].length();
        }

        // Calculate the pending points
        uint256 points = daysStaked * totalNftsStaked * pointsPerDay;

        return points;
    }

    /**
     * @dev Calculates the earned rewards based on points.
     * @param points The number of points earned.
     * @return uint256 The equivalent rewards in tokens.
     */
    function calculateEarnedRewards(
        uint256 points
    ) public view returns (uint256) {
        return (points * rewardTokensPerNftStaked) / pointsPerDay;
    }

    /**
     * @dev Returns the claimed points of a user.
     * @param _account The address of the user.
     * @return uint256 The claimed points.
     */
    function getClaimedPoints(
        address _account
    ) external view returns (uint256) {
        return userInfo[_account].claimedPoints;
    }

    /**
     * @dev Returns the redeemed rewards of a user.
     * @param _account The address of the user.
     * @return uint256 The redeemed rewards.
     */
    function getClaimedRewards(
        address _account
    ) external view returns (uint256) {
        return userInfo[_account].claimedRewards;
    }

    /**
     * @dev Returns the available NFTs for unstaking for a user.
     * @param _account The address of the user.
     * @return CollectionTokens[] A list of NFT collections and token IDs available for unstaking.
     */
    function getAvailableToUnstake(
        address _account
    ) external view returns (CollectionTokens[] memory) {
        uint256 collectionCount = collectionAddresses.length();
        CollectionTokens[] memory availableToUnstake = new CollectionTokens[](
            collectionCount
        );

        for (uint256 j = 0; j < collectionCount; j++) {
            address nftAddress = collectionAddresses.at(j);
            uint256 countNfts = userInfo[_account]
                .stakedNfts[nftAddress]
                .length();
            uint256[] memory tokenIds = new uint256[](countNfts);

            for (uint256 i = 0; i < countNfts; i++) {
                tokenIds[i] = userInfo[_account].stakedNfts[nftAddress].at(i);
            }

            availableToUnstake[j] = CollectionTokens({
                contractAddress: nftAddress,
                tokenIds: tokenIds
            });
        }

        return availableToUnstake;
    }

    /**
     * @dev Returns all collection addresses added to the platform.
     * @return address[] A list of all collection addresses.
     */
    function getAllCollectionAddresses()
        external
        view
        returns (address[] memory)
    {
        return collectionAddresses.values();
    }

    // Override functions

    /**
     * @dev Handles the receipt of an ERC721 token.
     * @param operator The address which called safeTransferFrom function.
     * @param from The address which previously owned the token.
     * @param tokenId The NFT identifier which is being transferred.
     * @param data Additional data with no specified format.
     * @return bytes4 Returns IERC721Receiver.onERC721Received.selector.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // Internal functions

    /**
     * @dev Internal modifier to ensure the treasury has sufficient balance.
     * @param _amount The amount to check.
     * @param _tokenAddress The address of the token to check.
     */
    modifier whenTreasuryHasBalance(uint256 _amount, address _tokenAddress) {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= _amount,
            "Insufficient balance in treasury"
        );
        _;
    }

    /**
     * @dev Updates the collection fee for adding a new collection.
     * @param _newFee The new fee amount.
     */
    function updateCollectionFee(uint256 _newFee) external onlyOwner {
        emit CollectionFeeUpdated(collectionFee, _newFee);
        collectionFee = _newFee;
    }
}
