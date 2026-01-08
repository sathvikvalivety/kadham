# Kadham Backend API

Node.js + Express API server for the Kadham sustainability platform.

## Responsibilities

- User registration and login (JWT-based auth).
- Wallet linking and verification (nonce + signature with MetaMask).
- Smart bin registry.
- Waste deposit recording and status tracking.
- Eco-product catalog.
- Transaction history.
- AI verification endpoint (stub only).
- Oracle integration with Ethereum RewardManager contract.

## Key Endpoints (Summary)

- `POST /api/auth/register` – Register a new user.
- `POST /api/auth/login` – Authenticate and receive JWT.
- `POST /api/wallets/request-link` – Request wallet verification nonce.
- `POST /api/wallets/verify` – Verify wallet signature.
- `GET /api/bins` – List smart bins.
- `POST /api/bins` – Create bin (admin only).
- `POST /api/deposits` – Create waste deposit.
- `GET /api/deposits/me` – List current user's deposits.
- `GET /api/products` – List eco-products.
- `GET /api/products/:id` – Get product details.
- `POST /api/ai/verify` – AI verification stub.
- `POST /api/rewards/deposit` – Trigger reward issuance for a verified deposit.
- `GET /api/transactions/me` – List current user's transactions.

## Running Locally

See `docs/DEPLOYMENT.md` for full details. Typical flow:

```sh
npm install
npm run dev
```

Make sure `.env` is configured and MySQL is running with the `schema.sql` applied.
