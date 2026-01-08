# Kadham Sustainability Platform

Kadham is a green incentive ecosystem that rewards users with blockchain tokens (GBC) for responsible waste disposal and nudges them toward eco-friendly purchases.

This monorepo contains:

- `frontend/` – React + Vite + Tailwind web app with MetaMask integration.
- `backend/` – Node.js + Express + MySQL API server and blockchain oracle.
- `blockchain/` – Ethereum smart contracts (GBC token and RewardManager) using Hardhat.
- `docs/` – Architecture, deployment, usage, AI integration, and security documentation.

## High-Level Flow

1. Users register and log in on the web app.
2. Users link and verify their Ethereum wallet via MetaMask.
3. Users use smart bins (represented by QR codes) to submit waste deposits through the app.
4. Backend records deposits and later verifies them via an AI verification interface (stubbed for now).
5. Once approved, backend acts as an oracle and calls the RewardManager contract, which mints GBC to the user.
6. Users can view their GBC balance in the app (from the token contract) and redeem GBC for eco-products.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Ethers.js, React Router.
- **Backend**: Node.js, Express, MySQL, JWT, Ethers.js, express-validator, express-rate-limit.
- **Blockchain**: Solidity, Hardhat, OpenZeppelin, Ethereum testnet (Sepolia).
- **Auth & Security**: JWT auth, nonce-based wallet verification, role-protected smart contracts, rate limiting, basic input validation.

## Running Locally (Summary)

See `docs/DEPLOYMENT.md` for full details. In short:

1. Create and migrate the MySQL database using `backend/db/schema.sql`.
2. Configure backend environment variables (DB, JWT secret, RPC URL, contract addresses, oracle key).
3. Deploy the smart contracts from `blockchain/` to Hardhat or Sepolia.
4. Start the backend API: `cd backend && npm install && npm run dev`.
5. Start the frontend: `cd frontend && npm install && npm run dev`.
6. Connect MetaMask to your chosen network and use the app via `http://localhost:5173`.

More details on architecture, security, and AI integration are in `docs/`.
