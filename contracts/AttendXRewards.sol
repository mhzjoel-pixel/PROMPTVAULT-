// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
library AttendXRewards { function reward(uint256 stakeAmount,uint256 fixedReward,uint256 apyBps,uint256 duration) internal pure returns(uint256){ if(fixedReward>0) return fixedReward; return stakeAmount * apyBps * duration / 365 days / 10_000; } }
