# PromptVault Economy Implementation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install @openzeppelin/contracts ethers@5.7.2 hardhat @nomiclabs/hardhat-ethers
```

### 2. Configure Environment
Create a `.env` file in the root:
```env
RECEIVER_WALLET={{RECEIVING_WALLET}}
PRIVATE_KEY=your_deployer_private_key
RPC_URL=your_rpc_url
ETHERSCAN_API_KEY=your_api_key
```

### 3. Deploy Smart Contracts
```bash
npx hardhat run scripts/deploy.js --network [network_name]
```

### 4. Verify on Etherscan
```bash
npx hardhat verify --network [network_name] [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
```

---

## 💎 Tokenomics ($UNIQ)
- **Total Supply:** 1,000,000,000
- **Allocation:** Liquidity (30%), Ecosystem (20%), Treasury (20%), Team (15%), Marketing (10%), Advisors (5%)
- **Team Vesting:** 12m Cliff, 24m Linear.

---

## 🛠 Developer Portal Whitelist
Paste the following JSON into the **Whitelist Addresses** field in your Developer Portal:

```json
{
  "canonical_receiver": "{{RECEIVING_WALLET}}",
  "purpose": "Protocol Revenue & Liquidity Management",
  "chains": ["Polygon", "Base", "Optimism"],
  "assets": ["USDC", "WLD", "UNIQ"]
}
```

---

## 📊 Analytics & Metrics
Run these SQL queries on your database to track growth:

### DAU (Daily Active Users)
```sql
SELECT date(created_at) as day, count(distinct user_id) as dau 
FROM activity 
GROUP BY day;
```

### Conversion Rate (Free to Paid)
```sql
SELECT 
  (SELECT count(distinct user_id) FROM purchases) * 100.0 / 
  (SELECT count(distinct address) FROM users) as conversion_rate;
```

---

## 🔐 Security Checklist
- [ ] **Input Validation:** All server routes use Joi/Zod for schema validation.
- [ ] **Reentrancy:** All financial contracts use `ReentrancyGuard`.
- [ ] **Multisig:** `RECEIVER_WALLET` should be a Gnosis Safe (2/3 or 3/5).
- [ ] **Rate Limiting:** Express server uses `express-rate-limit` on webhook endpoints.
- [ ] **Secrets:** No private keys or API keys are committed to git.
