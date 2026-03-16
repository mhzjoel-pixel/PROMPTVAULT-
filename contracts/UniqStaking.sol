// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title UniqStaking
 * @dev Staking contract for $UNIQ tokens to unlock discount tiers.
 * Tiers:
 * - Bronze: 100 UNIQ (5% Discount)
 * - Silver: 1,000 UNIQ (15% Discount)
 * - Gold: 10,000 UNIQ (40% Discount)
 */
contract UniqStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable uniqToken;

    struct Stake {
        uint256 amount;
        uint256 since;
    }

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public rewards;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDistributed(uint256 totalAmount);

    constructor(address _uniqToken, address initialOwner) Ownable(initialOwner) {
        uniqToken = IERC20(_uniqToken);
    }

    /**
     * @dev Stake $UNIQ tokens.
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(uniqToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].since = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake $UNIQ tokens.
     */
    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        
        stakes[msg.sender].amount -= amount;
        require(uniqToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim accumulated rewards.
     */
    function claimReward() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        
        rewards[msg.sender] = 0;
        require(uniqToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardPaid(msg.sender, reward);
    }

    /**
     * @dev Admin function to distribute rewards (called by off-chain cron job).
     * This distributes a fixed percentage to all stakers based on their share.
     */
    function distributeRewards(address[] calldata users, uint256[] calldata amounts) external onlyOwner {
        require(users.length == amounts.length, "Mismatched arrays");
        uint256 total = 0;
        for (uint256 i = 0; i < users.length; i++) {
            rewards[users[i]] += amounts[i];
            total += amounts[i];
        }
        emit RewardsDistributed(total);
    }

    /**
     * @dev Returns the discount tier for a user.
     * 0: No discount
     * 1: Bronze (5%) - 100 UNIQ
     * 2: Silver (15%) - 1,000 UNIQ
     * 3: Gold (40%) - 10,000 UNIQ
     */
    function getTier(address user) public view returns (uint8) {
        uint256 amount = stakes[user].amount;
        if (amount >= 10000 * 10**18) return 3; // Gold
        if (amount >= 1000 * 10**18) return 2;  // Silver
        if (amount >= 100 * 10**18) return 1;   // Bronze
        return 0;
    }

    /**
     * @dev Returns the discount percentage (0-100) for a user.
     */
    function getDiscount(address user) external view returns (uint256) {
        uint8 tier = getTier(user);
        if (tier == 3) return 40;
        if (tier == 2) return 15;
        if (tier == 1) return 5;
        return 0;
    }
}
