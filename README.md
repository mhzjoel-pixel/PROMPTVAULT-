# AttendX

AttendX is a production-oriented decentralized attendance, staking, and rewards platform for **World Chain Mainnet**.

## Architecture

- `contracts/AttendXCore.sol` — event registry, staking, attendance, slashing, reward claims, pause controls.
- `contracts/AttendXWorldID.sol` — World ID router integration, nullifier storage, duplicate identity prevention.
- `contracts/AttendXRewards.sol` — fixed and APY reward calculations.
- `contracts/AttendXToken.sol` — optional ERC-20 reward/staking token.
- `frontend/` — Next.js 14 App Router UI with RainbowKit/Wagmi, Tailwind, World ID IDKit.
- `backend/` — Express API for server-side World ID proof verification and secure integration boundaries.
- `prisma/schema.prisma` — PostgreSQL models for users, events, and stakes.
- `scripts/` — Hardhat deployment and verification helpers.

## Security model

- World ID proof is verified server-side and registered on-chain.
- `nullifierHash` is stored on-chain to reject duplicate identities.
- Staking and reward functions use `ReentrancyGuard`.
- Admin event lifecycle uses `Ownable`.
- Emergency pause is available for staking and reward flows.
- No-show users are slashed after event end; attendees can withdraw principal and claim rewards.

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run contracts:compile
npm run dev
```

## Deploy to World Chain Mainnet

Set these variables in `.env`:

```bash
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
DEPLOYER_PRIVATE_KEY=0x...
WORLD_ID_ROUTER=0x...
WORLD_ID_APP_ID=app_...
WORLD_ID_ACTION=attendx-verify
```

Deploy:

```bash
npm run deploy:worldchain
```

Verify contracts:

```bash
npm run verify:worldchain
```

## API

```http
POST /verify-world-id
POST /create-event
POST /stake
POST /claim-reward
GET /events
GET /user/:wallet
```

The API intentionally returns transaction-boundary guidance for privileged writes. Production deployments should require wallet signatures, nonces, and role checks before constructing any admin transaction.
