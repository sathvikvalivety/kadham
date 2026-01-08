# Kadham Architecture

Kadham is a modular, blockchain-enabled sustainability platform that rewards responsible waste disposal behavior with GBC tokens.

## Components

- **Frontend (React/Vite/Tailwind)**
  - SPA for user onboarding, MetaMask connect, waste deposit flows, product eco-score viewing, and GBC redemption.
- **Backend (Node/Express/MySQL)**
  - REST API for auth, wallet management, smart bins, waste deposits, eco-products, transactions, and AI verification stub.
  - Acts as an oracle to the Ethereum RewardManager contract.
- **Blockchain (Solidity/Hardhat)**
  - `GarbageBlockchainCoin` ERC-20 token (GBC) with AccessControl and Pausable.
  - `RewardManager` contract that mints GBC upon oracle calls.
- **Database (MySQL)**
  - Stores users, wallets, smart_bins, waste_deposits, transactions, and eco_products.

## ASCII System Diagram

```text
+-----------+        HTTPS        +-----------+        JSON-RPC        +---------------------+
|  Browser  | <-----------------> | Backend   | <--------------------> | Ethereum (Sepolia)  |
| (Frontend)|                    | API/Oracle|                          | GBC + RewardManager |
+-----------+                    +-----------+                          +---------------------+
      ^                                 |
      |                                 |
      v                                 v
+------------+                   +--------------+
| Smart Bins |  (QR codes)       |  MySQL DB    |
+------------+                   +--------------+
```

## Component Responsibilities

### Frontend

- Manage user session (JWT) and connect to MetaMask.
- Provide mock QR-code and product scan interfaces.
- Display eco-scores (mock), GBC balances, and transaction history.
- Orchestrate flows: waste deposit → verification status → reward redemption.

### Backend

- Expose REST endpoints for:
  - `/auth` – Registration and login.
  - `/wallets` – Wallet linking and nonce-based verification.
  - `/bins` – Smart bin registry (admin-controlled).
  - `/deposits` – Waste deposit lifecycle.
  - `/products` – Eco product catalog.
  - `/rewards` – Reward issuance via blockchain oracle.
  - `/ai` – AI verification stub endpoint.
  - `/transactions` – Transaction history.
- Maintain relational state in MySQL.
- Enforce authentication, authorization, and basic rate limiting.
- Serve as a trusted oracle to the RewardManager contract.

### Blockchain Layer

- **GBC Token**
  - ERC-20 with `DEFAULT_ADMIN_ROLE`, `PAUSER_ROLE`, and `MINTER_ROLE`.
  - Only RewardManager (with MINTER_ROLE) can mint new tokens.
  - Pausable transfers and minting for emergencies.
- **RewardManager**
  - Holds `ORACLE_ROLE`-protected `rewardDeposit` function.
  - Mints GBC to user wallets when called by backend oracle.
  - Emits `RewardIssued(user, amount, offchainDepositId)` events for auditability.

## Data Flow: Waste → GBC → Purchase

1. **Waste Deposit**
   - User authenticates and links wallet.
   - User scans a smart bin QR (mock) and submits a waste deposit via frontend.
   - Backend records a `waste_deposits` row with status `PENDING_VERIFICATION`.

2. **Verification (AI Stub)**
   - An AI service (future) or current stub calls `/api/ai/verify` with `depositId`.
   - Backend updates the `waste_deposits` row with eco-score and status `APPROVED` or `REJECTED`.

3. **Reward Issuance (Oracle)**
   - For approved deposits, user calls `/api/rewards/deposit`.
   - Backend oracle calls `RewardManager.rewardDeposit(userWallet, amount, offchainDepositId)`.
   - RewardManager mints GBC via the GBC token and emits an event.
   - Backend records a `transactions` row linking on-chain tx hash to the off-chain deposit.

4. **Redemption**
   - User checks GBC balance via frontend using Ethers.js and the GBC contract.
   - User chooses eco-products (from `eco_products`) and initiates redemption.
   - Current implementation records only an off-chain intent; on-chain redemption can be added without breaking the existing design.

## Modularity and Extensibility

- AI logic is not present in this codebase. Instead, `/api/ai/verify` defines a stable contract for AI services.
- The oracle service is encapsulated in a dedicated backend module, making it easy to swap providers or networks.
- Env-driven configuration allows the same codebase to run against Hardhat, Sepolia, or mainnet.
- Frontend uses a thin API client and Ethereum helper, so both backend URL and contract addresses are replaceable.
