# Kadham Frontend

React + Vite + Tailwind single-page application for the Kadham sustainability platform.

## Features

- User registration and login via backend API.
- MetaMask wallet connect (no direct on-chain writes from the browser in this version).
- View GBC token balance via Ethers.js.
- Mock QR scan UI for smart bins and products.
- Waste deposit request screen.
- Product eco-score display based on backend catalog.
- Redeem UI for GBC → eco-products (off-chain intent).
- Transaction history table.

## Scripts

- `npm run dev` – Start Vite dev server.
- `npm run build` – Production build.
- `npm run preview` – Preview built app.

## Configuration

Environment variables (via `.env`):

- `VITE_API_BASE_URL` – Backend API base URL (e.g., `http://localhost:4000/api`).
- `VITE_GBC_TOKEN_ADDRESS` – GBC token contract address.
- `VITE_REWARD_MANAGER_ADDRESS` – RewardManager contract address.

## Notes

- QR and product scanning are mocked; users type or select codes to simulate scans.
- No AI logic runs in the browser; AI is represented only through backend endpoints.
