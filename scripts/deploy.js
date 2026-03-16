const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const RECEIVER_WALLET = process.env.RECEIVER_WALLET || "{{RECEIVING_WALLET}}";

  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy UNIQ Token
  const UniqToken = await hre.ethers.getContractFactory("UniqToken");
  const uniq = await UniqToken.deploy(RECEIVER_WALLET);
  await uniq.deployed();
  console.log("UniqToken deployed to:", uniq.address);

  // 2. Deploy Staking
  const UniqStaking = await hre.ethers.getContractFactory("UniqStaking");
  const staking = await UniqStaking.deploy(uniq.address, RECEIVER_WALLET);
  await staking.deployed();
  console.log("UniqStaking deployed to:", staking.address);

  // 3. Deploy Subscription NFT
  const UniqSubscriptionNFT = await hre.ethers.getContractFactory("UniqSubscriptionNFT");
  const subNft = await UniqSubscriptionNFT.deploy(RECEIVER_WALLET);
  await subNft.deployed();
  console.log("UniqSubscriptionNFT deployed to:", subNft.address);

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log(`VITE_UNIQ_TOKEN_ADDRESS=${uniq.address}`);
  console.log(`VITE_STAKING_ADDRESS=${staking.address}`);
  console.log(`VITE_SUBSCRIPTION_NFT_ADDRESS=${subNft.address}`);
  console.log(`VITE_RECEIVER_WALLET=${RECEIVER_WALLET}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
