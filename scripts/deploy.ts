import { ethers } from 'hardhat';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const router = requiredEnv('WORLD_ID_ROUTER');
  if (!ethers.isAddress(router) || router === ethers.ZeroAddress) throw new Error('WORLD_ID_ROUTER must be a non-zero address');
  const appId = requiredEnv('WORLD_ID_APP_ID');
  const action = process.env.WORLD_ID_ACTION || 'attendx-verify';

  const Token = await ethers.getContractFactory('AttendXToken');
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const World = await ethers.getContractFactory('AttendXWorldID');
  const world = await World.deploy(router, 1, appId, action, deployer.address);
  await world.waitForDeployment();

  const Core = await ethers.getContractFactory('AttendXCore');
  const core = await Core.deploy(await token.getAddress(), await world.getAddress(), deployer.address);
  await core.waitForDeployment();

  console.log({ token: await token.getAddress(), worldId: await world.getAddress(), core: await core.getAddress() });
}

main().catch((e) => { console.error(e); process.exit(1); });
