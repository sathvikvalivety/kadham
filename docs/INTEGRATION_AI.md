# AI Integration Guide

Kadham is designed to integrate AI/ML services for waste classification and verification, but **no AI implementation is included in this codebase**. Instead, the backend exposes stable interfaces for AI services to call.

## Design Principles

- **No hard dependency**: The platform runs with a deterministic stub in place of AI.
- **Clear contracts**: API request/response structures for AI are well-defined.
- **Replaceable**: Any compliant AI service can be plugged in without changing the frontend or smart contracts.

## AI Verification Endpoint

### Endpoint

- `POST /api/ai/verify`

### Request Body (from AI service)

The AI service sends a JSON payload containing at least:

```json
{
  "depositId": 123,
  "analysis": {
    "source": "ai-model-v1",
    "metadata": {
      "binId": 7,
      "userId": 42
    }
  }
}
```

Fields:

- `depositId` – The ID of the `waste_deposits` row to verify.
- `analysis` – Optional object for AI metadata (model version, context). The current stub ignores this but future implementations can consume it.

### Stubbed Response (Current Behavior)

The current implementation in `aiController` returns deterministic data:

```json
{
  "verified": true,
  "depositId": 123,
  "materialType": "MIXED_RECYCLABLES",
  "weightKg": 1.0,
  "ecoScore": 80,
  "confidence": 0.9,
  "explanations": "Stubbed verification. Replace with AI service integration."
}
```

This is **not** based on any model.

### Expected AI Implementation

A real AI service should:

1. Retrieve the relevant deposit context (images, sensor data, etc.).
2. Run ML models to determine:
   - Whether the deposit is valid.
   - Material type(s).
   - Estimated weight.
   - Eco-score (e.g., scaled 0–100).
3. Call `POST /api/ai/verify` with:

```json
{
  "depositId": 123,
  "analysis": {
    "model": "waste-classifier-x",
    "version": "1.2.0",
    "rawScores": { "plastic": 0.8, "metal": 0.2 }
  }
}
```

4. The backend then updates the `waste_deposits` record with `status`, `material_type`, `weight_kg`, and `eco_score`.

## Oracle Flow with AI

1. **Deposit Creation** – User creates a deposit; backend sets status `PENDING_VERIFICATION`.
2. **AI Processing** – AI service analyzes data and calls `/api/ai/verify`.
3. **Backend Update** – Backend sets `status` to `APPROVED` or `REJECTED` and stores eco-score.
4. **Reward Trigger** – For `APPROVED` deposits, the user can call `/api/rewards/deposit`.
5. **Oracle Call** – Backend calls `RewardManager.rewardDeposit` as the oracle.
6. **On-chain Event** – RewardManager mints GBC and emits `RewardIssued`.

The AI layer does **not** talk directly to the blockchain; it only talks to the backend.

## Error Handling and Idempotency

- AI services should treat `/api/ai/verify` as idempotent for a given `depositId`.
- If verification is retried, the backend can either overwrite the previous decision or enforce a single-write policy depending on business rules.

## Security Considerations for AI Integrations

- Protect `/api/ai/verify` with authentication and possibly mutual TLS when deployed across services.
- Validate all incoming AI data; never trust external services blindly.
- Log AI decisions and tie them to model versions for auditability.
