# Kadham Blockchain Layer

This package contains the Ethereum smart contracts, tests, and deployment scripts for the Kadham sustainability platform.

## Components

- `GarbageBlockchainCoin` (`GBC`): ERC-20 token used to reward sustainable actions.
- `RewardManager`: Contract that mints GBC after off-chain verification by the backend oracle.

## Key Properties

- Role-based access control for admin, pauser, minter, and oracle responsibilities.
- Pausable token transfers and minting for emergency control.
- Events for reward issuance to support transparent audit trails.

## Scripts

- `npm run compile` – Compile contracts.
- `npm test` – Run Hardhat tests.
- `npm run deploy:sepolia` – Deploy GBC and RewardManager to Sepolia (requires env vars configured).

## Environment Variables

Define the following in a `.env` file in this directory before deploying:

- `SEPOLIA_RPC_URL` – HTTPS RPC URL for Sepolia.
- `ORACLE_PRIVATE_KEY` – Private key of the deployer/oracle account (no `0x` prefix).
- `ETHERSCAN_API_KEY` – Optional, for contract verification.

## Oracle Role Assignment

After deployment, grant the `ORACLE_ROLE` on `RewardManager` to the backend oracle address. The deployment script logs the role hash to assist with on-chain administration.
