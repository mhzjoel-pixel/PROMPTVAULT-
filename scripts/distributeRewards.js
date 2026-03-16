const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * @script distributeRewards
 * @desc Off-chain cron job to calculate and distribute $UNIQ rewards to stakers.
 * Run this daily or weekly via GitHub Actions or a local cron job.
 */
async function main() {
  const STAKING_ADDRESS = process.env.VITE_STAKING_ADDRESS;
  const REWARD_APY = 0.10; // 10% APY
  const DISTRIBUTION_PERIOD = 1 / 365; // Daily distribution

  if (!STAKING_ADDRESS) {
    console.error("VITE_STAKING_ADDRESS not set");
    return;
  }

  const [admin] = await ethers.getSigners();
  const staking = await ethers.getContractAt("UniqStaking", STAKING_ADDRESS);

  console.log("Starting reward distribution from:", admin.address);

  // 1. Fetch stakers from events (simplified for this example)
  // In production, use a subgraph or a database of stakers.
  const filter = staking.filters.Staked();
  const events = await staking.queryFilter(filter);
  const stakers = [...new Set(events.map(e => e.args.user))];

  const usersToReward = [];
  const rewardAmounts = [];

  for (const user of stakers) {
    const stakeInfo = await staking.stakes(user);
    const amount = stakeInfo.amount;

    if (amount.gt(0)) {
      // Calculate reward: amount * APY * (period)
      // BigNumber math for precision
      const reward = amount.mul(Math.floor(REWARD_APY * 10000)).div(10000).mul(Math.floor(DISTRIBUTION_PERIOD * 10000)).div(10000);
      
      if (reward.gt(0)) {
        usersToReward.push(user);
        rewardAmounts.push(reward);
        console.log(`User ${user}: Reward ${ethers.utils.formatEther(reward)} UNIQ`);
      }
    }
  }

  if (usersToReward.length > 0) {
    console.log(`Distributing rewards to ${usersToReward.length} users...`);
    const tx = await staking.distributeRewards(usersToReward, rewardAmounts);
    await tx.wait();
    console.log("Distribution complete. TX:", tx.hash);
  } else {
    console.log("No rewards to distribute.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
