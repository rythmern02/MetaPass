// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract GuitarNftStaking is Ownable(msg.sender), IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant POINTS_PER_DAY = 10;
    uint256 public constant MIN_STAKE_DURATION = 60 days;

    // Staking NFT address
    address public stakeNftAddress;
    // Reward Token address
    address public rewardTokenAddress;

    // Max NFTs that a user can stake
    uint256 public maxNftsPerUser;

    struct UserInfo {
        EnumerableSet.UintSet stakedNfts;
        uint256 redeemedRewards;
        uint256 earnedPoints;
        uint256 claimedPoints;
        uint256 lastStakedTime;
        uint256 earnedRewards;
    }

    mapping(address => UserInfo) private userInfo;

    event RewardTokenUpdated(address oldToken, address newToken);
    event RewardPerBlockUpdated(uint256 oldValue, uint256 newValue);
    event Staked(address indexed account, uint256 tokenId);
    event Withdrawn(address indexed account, uint256 tokenId);
    event Harvested(address indexed account, uint256 amount);
    event InsufficientRewardToken(
        address indexed account,
        uint256 amountNeeded,
        uint256 balance
    );
    event PointsClaimed(address indexed account, uint256 points);

    constructor(address _stakeNftAddress) {
        stakeNftAddress = _stakeNftAddress;
        maxNftsPerUser = 10; // Default max NFTs per user
    }

    function viewUserInfo(address _account)
        external
        view
        returns (
            uint256[] memory stakedNfts,
            uint256 redeemedRewards,
            uint256 earnedPoints,
            uint256 claimedPoints,
            uint256 lastStakedTime,
            uint256 earnedRewards
        )
    {
        UserInfo storage user = userInfo[_account];
        redeemedRewards = user.redeemedRewards;
        earnedPoints = user.earnedPoints;
        claimedPoints = user.claimedPoints;
        lastStakedTime = user.lastStakedTime;
        earnedRewards = user.earnedRewards;
        uint256 countNfts = user.stakedNfts.length();
        stakedNfts = new uint256[](countNfts);
        for (uint256 i = 0; i < countNfts; i++) {
            stakedNfts[i] = user.stakedNfts.at(i);
        }
    }

    function updateMaxNftsPerUser(uint256 _maxLimit) external onlyOwner {
        require(_maxLimit > 0, "Invalid limit value");
        maxNftsPerUser = _maxLimit;
    }

    function updateRewardTokenAddress(address _rewardTokenAddress)
        external
        onlyOwner
    {
        emit RewardTokenUpdated(rewardTokenAddress, _rewardTokenAddress);
        rewardTokenAddress = _rewardTokenAddress;
    }

    function isStaked(address _account, uint256 _tokenId)
        public
        view
        returns (bool)
    {
        UserInfo storage user = userInfo[_account];
        return user.stakedNfts.contains(_tokenId);
    }

    function calculatePendingPoints(address _account)
        public
        view
        returns (uint256)
    {
        UserInfo storage user = userInfo[_account];
        if (user.lastStakedTime == 0) {
            return 0;
        }
        uint256 stakedDuration = block.timestamp - user.lastStakedTime;
        uint256 points = (stakedDuration / 1 days) * POINTS_PER_DAY;
        return points;
    }

    function calculateEarnedRewards(uint256 points) public pure returns (uint256) {
        return points / 10;
    }

    function stake(uint256[] memory tokenIdList) external {
        require(
            userInfo[msg.sender].stakedNfts.length() + tokenIdList.length <=
                maxNftsPerUser,
            "Exceeds the max limit per user"
        );

        UserInfo storage user = userInfo[msg.sender];

        // Update earned points
        user.earnedPoints += calculatePendingPoints(msg.sender);

        for (uint256 i = 0; i < tokenIdList.length; i++) {
            IERC721(stakeNftAddress).safeTransferFrom(
                msg.sender,
                address(this),
                tokenIdList[i]
            );
            user.stakedNfts.add(tokenIdList[i]);
            emit Staked(msg.sender, tokenIdList[i]);
        }
        user.lastStakedTime = block.timestamp;

        // Update earned rewards
        user.earnedRewards = calculateEarnedRewards(user.earnedPoints);
    }

    function withdraw(uint256[] memory tokenIdList) external {
        UserInfo storage user = userInfo[msg.sender];

        // Update earned points
        user.earnedPoints += calculatePendingPoints(msg.sender);

        for (uint256 i = 0; i < tokenIdList.length; i++) {
            require(
                isStaked(msg.sender, tokenIdList[i]),
                "Not staked this NFT"
            );

            IERC721(stakeNftAddress).safeTransferFrom(
                address(this),
                msg.sender,
                tokenIdList[i]
            );
            user.stakedNfts.remove(tokenIdList[i]);
            emit Withdrawn(msg.sender, tokenIdList[i]);
        }
        user.lastStakedTime = block.timestamp;

        // Update earned rewards
        user.earnedRewards = calculateEarnedRewards(user.earnedPoints);
    }

    function claimPoints() external {
        UserInfo storage user = userInfo[msg.sender];
        require(
            block.timestamp >= user.lastStakedTime + MIN_STAKE_DURATION,
            "Staking period not completed"
        );
        uint256 pendingEarnedPoints = calculatePendingPoints(msg.sender);
        uint256 totalEarnedPoints = user.earnedPoints + pendingEarnedPoints;
        require(totalEarnedPoints > user.claimedPoints, "No points to claim");
        uint256 pointsToClaim = totalEarnedPoints - user.claimedPoints;
        user.claimedPoints = totalEarnedPoints;
        emit PointsClaimed(msg.sender, pointsToClaim);

        // Update earned rewards
        user.earnedRewards = calculateEarnedRewards(user.earnedPoints);
    }

    function releaseRewards(address _to, uint256 _amount) external onlyOwner {
        require(
            rewardTokenAddress != address(0),
            "Reward token address not set"
        );
        uint256 balance = IERC20(rewardTokenAddress).balanceOf(address(this));
        require(balance >= _amount, "Insufficient reward token balance");
        IERC20(rewardTokenAddress).safeTransfer(_to, _amount);

        // Update redeemed rewards
        userInfo[_to].redeemedRewards += _amount;
        
        emit Harvested(_to, _amount);
    }

    function getEarnedPoints(address _account) external view returns (uint256) {
        UserInfo storage user = userInfo[_account];
        return user.earnedPoints + calculatePendingPoints(_account);
    }

    function getEarnedRewards(address _account) external view returns (uint256) {
        UserInfo storage user = userInfo[_account];
        return calculateEarnedRewards(user.earnedPoints + calculatePendingPoints(_account));
    }

    function getClaimedPoints(address _account) external view returns (uint256) {
        UserInfo storage user = userInfo[_account];
        return user.claimedPoints;
    }

    function getRedeemedRewards(address _account) external view returns (uint256) {
        UserInfo storage user = userInfo[_account];
        return user.redeemedRewards;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
