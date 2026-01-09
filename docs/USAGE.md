# Kadham Usage

This document describes the main user and admin flows and how waste turns into GBC and then into sustainable purchases.

## User Journey

### 1. Registration and Login

1. Open the Kadham web app.
2. Register with an email and password.
3. Log in to receive a JWT-backed session.

### 2. Wallet Connection and Verification

1. Connect MetaMask using the "Connect Wallet" button in the navbar.
2. Use the wallet linking flow from the UI (provided via API endpoints) to:
   - Request a nonce from the backend.
   - Sign the nonce with MetaMask.
   - Send the signature back to the backend to mark the wallet as verified.

This binds the Ethereum address to your Kadham user profile.

### 3. Making a Waste Deposit

1. Navigate to the **Deposit** page.
2. Use the mock QR scanner to enter or simulate a smart bin QR code.
3. Describe your waste (e.g., "3kg mixed recyclables").
4. Submit the deposit.
5. The backend records a `waste_deposits` entry with status `PENDING_VERIFICATION`.

### 4. Verification and Rewards

1. For now, verification is performed by a stub endpoint (`/api/ai/verify`). In a real deployment, an AI service would call this route after classifying the waste.
2. Once the deposit is approved, its status becomes `APPROVED` and an eco-score is attached.
3. You can then trigger a reward by calling the reward endpoint (via the app UI), which will:
   - Call the RewardManager contract on Ethereum via the backend oracle.
   - Mint GBC to your verified wallet.
   - Record a `transactions` row linked to the deposit.

### 5. Viewing Balances and History

- **GBC balance** is read from the GBC token contract using Ethers.js and shown on the dashboard.
- **Transaction history** is read from the backend `/transactions/me` endpoint and displayed in the **History** page.

### 6. Redeeming GBC for Eco-Products

1. Navigate to the **Redeem** page.
2. Choose an eco-product from the catalog.
3. Initiate redemption (currently recorded as an off-chain intent, with a mock confirmation message).
4. Future versions can extend this to on-chain redemption or voucher issuance without breaking the existing design.

## Admin Flow

- Admins are users with `role = 'admin'` in the `users` table.
- Admin-specific capabilities can include:
  - Managing smart bins via `/api/bins` (create/update bins, change status).
  - Managing the product catalog via CRUD endpoints (extendable from the current read-only setup).
  - Monitoring deposits, approvals, and rewards using database queries and logs.

## Admin Capabilities

There is currently no dedicated UI for admins. Admin actions must be performed via API client (like Postman or curl) or direct database access.

### 1. Becoming an Admin

By default, all registered users have the role `user`. To make a user an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 2. Available Admin Actions

**Create Smart Bin**
- **Endpoint**: `POST /api/bins`
- **Headers**:
  - `Authorization`: `Bearer <your-jwt-token>`
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "location": "Central Station",
    "qrCode": "BIN-003"
  }
  ```

## Waste → GBC → Purchase Loop (End-to-End)

1. **Deposit**: User drops waste into a smart bin and submits a deposit via the app.
2. **Verification**: Off-chain logic (AI) verifies the waste and assigns an eco-score.
3. **Reward**: Backend oracle mints GBC to the user’s wallet using RewardManager.
4. **Balance**: User sees their GBC balance increasing over time.
5. **Redemption**: User redeems GBC for curated eco-products, closing the incentive loop.

Throughout this loop, events on-chain and records in the database make the process auditable and transparent.
