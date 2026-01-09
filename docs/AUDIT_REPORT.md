# Codebase Audit & Process Flow

## Process Flow Diagram

```mermaid
graph TD
    User([User])
    Admin([Admin])
    
    subgraph Frontend
        Register[Register/Login]
        Connect[Connect Wallet]
        DepositUI[Deposit Waste]
        HistoryUI[View History]
        RedeemUI[Redeem Rewards]
    end
    
    subgraph Backend
        AuthAPI[Auth API]
        WalletAPI[Wallet API]
        DepositAPI[Deposit API]
        Oracle[Oracle Service]
        DB[(MySQL Database)]
    end
    
    subgraph Blockchain
        GBC[GBC Token Contract]
        Reward[Reward Manager]
    end
    
    %% Flows
    User --> Register
    Register --> AuthAPI
    AuthAPI --> DB
    
    User --> Connect
    Connect --> WalletAPI
    WalletAPI --> DB
    
    User --> DepositUI
    DepositUI --> DepositAPI
    DepositAPI -->|1. Store Pending| DB
    DepositAPI -.->|2. Verify via AI stub| Oracle
    
    Oracle -->|3. Mint Tokens| Reward
    Reward -->|4. Transfer GBC| GBC
    GBC -->|5. Update Balance| User
    
    Admin -->|Create Bins| DepositAPI
    
    User --> RedeemUI
    RedeemUI -->|Check Balance| GBC
    RedeemUI -->|Record| DB
```

## Audit Findings

### Blockchain
- **Architecture**: Separates Token (`GarbageBlockchainCoin`) from Logic (`RewardManager`). Good for upgradability.
- **Access Control**: Uses `AccessControl` (RBAC) securely. `MINTER_ROLE` is restricted to `RewardManager` and Admin. `ORACLE_ROLE` restricts who can trigger payouts.
- **Security**:
    - `GarbageBlockchainCoin` is `Pausable`, allowing emergency stops.
    - `RewardManager` checks for zero-address and zero-amount to prevent burning gas on invalid calls.

### Backend
- **Authentication**: JWT-based auth with `authenticateJWT` middleware.
- **Wallet Link**: Standard "Sign-in with Ethereum" (SIWE) pattern using hashed nonces.
    - *Observation*: Nonce is generated on server, signed by client, verified on server. Secure against replay attacks.
- **Rewards**:
    - `rewardController` explicitly checks `deposit.status === 'APPROVED'`.
    - Cross-references `user_id` on deposit vs `req.user.id` to prevent claiming others' deposits.
- **Oracle Service**:
    - Uses `ethers.js` with a private key stored in `.env`.
    - *Risk*: `ORACLE_PRIVATE_KEY` is hot/online. In production, this should be a KMS-backed signer or Relayer.

### Frontend
- **Routing**: Protected routes (e.g., `/deposit`) redirect to login if no token found.
- **State Management**: `localStorage` used for JWT. *Standard practice*, though `httpOnly` cookies are safer for high-security apps.
- **Waste Deposit UI**:
    - Mock QR scanner implementation (`Math.random() > 0.5` logic seen in similar mockups, confirming simplicity).
    - clear separation of UI state (`scanning`, `submitting`, `success`).

### Improvement Recommendations
1.  **Security**: Move `ORACLE_PRIVATE_KEY` to a Key Management Service (AWS KMS / Google Cloud KMS) or use a Relayer service (OpenZeppelin Defender) instead of a hot wallet.
2.  **Scalability**: The `RewardManager` should implement a daily cap on rewards to limit potential exploit damage.
3.  **UX**: Add a real QR scanner library (e.g., `react-qr-reader`) to replace the mock button.
4.  **Database**: Add an index on `waste_deposits.status` for faster querying by the admin/AI verification service.

## Implementation Roadmap & Improvements

### 1. Low Effort (Immediate Wins)
- [x] **Linting & Formatting**: Add `eslint` and `prettier` to Backend/Frontend `package.json` scripts to catch potential bugs early.
    - *Action*: `npm install --save-dev eslint prettier`
- [x] **Input Validation**: Expand use of `express-validator` across all Backend POST/PUT routes (currently only on `/bins`).
- [x] **CORS Security**: Restrict `cors` middleware origin to the specific Frontend URL (currently varies by environment).
- [x] **Frontend Tests**: Initialize `vitest` or `jest` for pure function testing in `frontend/src/utils`.

### 2. Medium Effort (Stability & Quality)
- [ ] **Database Indexing**: Add indexes to `waste_deposits(user_id, status)` and `transactions(user_id)` for faster dashboard loading.
    - *Action*: `CREATE INDEX idx_deposits_user_status ON waste_deposits(user_id, status);`
- [ ] **Rate Limiting**: Tune `express-rate-limit` configuration. Currently uses defaults; needs per-endpoint tuning (stricter on `/auth/**`).
- [ ] **Real QR Scanner**: Replace `QRScanMock` with `react-qr-reader` in `WasteDepositPage.jsx`.
- [ ] **Dockerization**: Create `Dockerfile` and `docker-compose.yml` for consistent dev/prod environments (Frontend + Backend + MySQL).

### 3. High Effort (Security & Scalability)
- [ ] **KMS Oracle Signer**: Replace the hot wallet in `oracleService.js` with AWS KMS or Google Cloud KMS signing.
    - *Reason*: Prevents private key leakage from compromising the entire reward system.
- [ ] **Reward Capping**: Implement a daily GBC minting cap in `RewardManager.sol` to limit damage from potential exploits.
- [ ] **Queue System**: Move blockchain interactions (minting) to a background job queue (e.g., BullMQ + Redis) to prevent HTTP timeouts.
