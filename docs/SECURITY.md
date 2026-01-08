# Security Design

Kadham emphasizes transparency, trust, and modularity. This document describes the main security controls.

## Authentication and Sessions

- Users authenticate with email/password.
- Passwords are hashed with bcrypt before storage.
- Successful login returns a JWT containing user ID, email, and role.
- JWTs are signed with a secret key and have configurable expiry.

## Authorization

- Backend middleware (`authenticateJWT`) ensures protected routes require a valid JWT.
- Role-based checks in code (e.g., `authorizeRole('admin')`) protect admin-only operations such as managing smart bins.

## Wallet Verification

- Wallets are linked using a nonce-based challenge-response protocol:
  1. User requests wallet link, backend generates a random nonce and stores it.
  2. User signs a standardized message containing the nonce with MetaMask.
  3. Backend verifies the signature and, if valid, marks the wallet as verified.
- This prevents address spoofing and proves ownership of the wallet.

## Smart Contract Role Protection

- GBC token uses AccessControl roles:
  - `DEFAULT_ADMIN_ROLE` – Can manage roles.
  - `PAUSER_ROLE` – Can pause/unpause transfers and minting.
  - `MINTER_ROLE` – Granted to RewardManager only.
- RewardManager uses:
  - `DEFAULT_ADMIN_ROLE` – Contract administration.
  - `ORACLE_ROLE` – Only oracle addresses can call `rewardDeposit`.
- This ensures that only authorized backend oracles can mint new GBC via RewardManager.

## API Rate Limiting and Validation

- Global rate limiter limits the number of requests per IP in a sliding window.
- Input validation is handled via `express-validator` and a validation middleware that rejects malformed requests with `400` responses.

## Replay Protection

- Wallet verification nonces are unique per request and updated after each attempt.
- Reusing an old signature with a new nonce will fail.
- JWTs have expiry; long-lived refresh tokens can be added separately if needed.

## Transport Security

- In production, all traffic between frontend and backend should use HTTPS.
- Communication between backend and AI services should also be encrypted and authenticated.

## Secrets Management

- Secrets such as database credentials, JWT secret, RPC URL, and private keys are loaded from environment variables.
- `.env` files should never be committed to version control.

## Logging and Auditability

- Backend logs errors and key actions (such as reward failures) to standard output.
- On-chain events (`RewardIssued`) provide a transparent, immutable record of reward issuance.
- Database tables (`waste_deposits`, `transactions`) link off-chain records to on-chain tx hashes for full traceability.

## Future Enhancements

- Integrate a centralized logging/monitoring stack.
- Add multi-signature controls around critical admin functions on-chain.
- Implement API keys or OAuth for AI integration endpoints.
