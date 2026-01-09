# Kadham Deployment

This document describes how to run Kadham locally and how to deploy the blockchain and backend components.

## Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8+
- MetaMask browser extension

## 1. Database Setup

1. Create a new MySQL database, for example:

   ```sql
   CREATE DATABASE kadham CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Apply the schema:

   ```sh
   mysql -u <user> -p kadham < backend/db/schema.sql
   ```

   *Note: The schema includes initial seed data for smart bins (BIN-001, BIN-002) to verify deposits immediately.*

## 2. Blockchain Deployment

1. Navigate to the blockchain project:

   ```sh
   cd blockchain
   npm install
   ```

2. Create a `.env` file:

   ```ini
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your-project-id>
   ORACLE_PRIVATE_KEY=<private-key-without-0x>
   ETHERSCAN_API_KEY=<optional>
   ```

3. Deploy to Sepolia:

   ```sh
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   Note the deployed addresses for:

   - `GarbageBlockchainCoin`
   - `RewardManager`

4. Grant the `ORACLE_ROLE` on `RewardManager` to the backend oracle address (usually the same as the deployer, but can be changed):

   - Use Hardhat console or a script to call `grantRole(ORACLE_ROLE, <oracle-address>)`.

## 3. Backend Configuration and Startup

1. Navigate to the backend project:

   ```sh
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/`:

   ```ini
   PORT=4000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=kadham
   DB_PASSWORD=kadham
   DB_NAME=kadham

   JWT_SECRET=super-secret-jwt-key
   JWT_EXPIRES_IN=1h

   BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/<your-project-id>
   REWARD_MANAGER_ADDRESS=<reward-manager-address-from-deploy>
   ORACLE_PRIVATE_KEY=<same-private-key-used-on-chain>
   ```

3. Start the backend in development mode:

   ```sh
   npm run dev
   ```

   The API will listen on `http://localhost:4000`.

## 4. Frontend Configuration and Startup

1. Navigate to the frontend project:

   ```sh
   cd frontend
   npm install
   ```

2. Create a `.env` file in `frontend/`:

   ```ini
   VITE_API_BASE_URL=http://localhost:4000/api
   VITE_GBC_TOKEN_ADDRESS=<gbc-token-address-from-deploy>
   VITE_REWARD_MANAGER_ADDRESS=<reward-manager-address-from-deploy>
   ```

3. Start the dev server:

   ```sh
   npm run dev
   ```

4. Open the app in your browser at `http://localhost:5173`.

## 5. MetaMask Setup

1. Install MetaMask in your browser if not already installed.
2. Add the Sepolia network (if needed) or use the preconfigured Sepolia test network.
3. Import the oracle/deployer account using the private key used above.
4. Fund the account with test ETH (via a Sepolia faucet) so that it can pay gas for reward transactions.

## 6. Environment-based Configurations

- All sensitive values (DB credentials, JWT secret, RPC URL, private key, contract addresses) are configured via environment variables.
- Do not commit `.env` files to version control.

## 7. Running Tests

- **Blockchain tests**:

  ```sh
  cd blockchain
  npx hardhat test
  ```

- **Backend tests**:

  ```sh
  cd backend
  npm test
  ```

- **Frontend tests**: a placeholder test script is configured; you can integrate your preferred testing framework.
