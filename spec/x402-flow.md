# x402 Payment Flow

**Status:** Stable · **Version:** 1.0

This document specifies the full HTTP `402` payment handshake used by Rail402
providers and by any service that adopts the Agent Services standard. It is
transport-agnostic above HTTP and settlement-specific to **USDC on Base**.

## 1. Roles

- **Caller** — an AI agent (or any client) that wants a paid result.
- **Provider** — the HTTP service exposing a paid endpoint.
- **Chain** — Base (mainnet `8453`) or Base Sepolia (`84532`).

## 2. Overview

```
Caller                         Provider                         Base
  │  (1) request (no proof)        │                              │
  │ ─────────────────────────────▶│                              │
  │  (2) 402 + PaymentRequirements │                              │
  │ ◀─────────────────────────────│                              │
  │                                                               │
  │  (3) USDC transfer(payTo, amountAtomic)                       │
  │ ─────────────────────────────────────────────────────────── ▶│
  │  (4) tx hash                                                  │
  │ ◀─────────────────────────────────────────────────────────── │
  │  (5) retry request + X-Payment-Proof                          │
  │ ─────────────────────────────▶│  (6) verify tx on-chain ─────▶│
  │                                │ ◀──────── receipt ───────────│
  │  (7) 200 + result              │                              │
  │ ◀─────────────────────────────│                              │
```

## 3. Step-by-step

### (1) Initial request

The caller issues the normal request for the resource with **no** payment proof.

### (2) Payment challenge

If payment is required and absent, the provider MUST respond with HTTP `402` and
a JSON body conforming to `PaymentRequirements` (below). It SHOULD also set the
companion headers in §5.

```json
{
  "type": "x402_payment_required",
  "amount": "0.05",
  "amountAtomic": "50000",
  "currency": "USDC",
  "network": "base",
  "chainId": 8453,
  "payTo": "0x1111111111111111111111111111111111111111",
  "resource": "/api/risk",
  "expiresAt": "2026-06-01T12:34:56.000Z"
}
```

- `amountAtomic` is the authoritative amount, in USDC's 6-decimal base units.
  `amount` is a human-readable convenience and MUST equal `amountAtomic` scaled
  by `10^-6`.
- `expiresAt` bounds how long the caller may assume the price holds. Providers
  MAY reject proofs for transactions mined after a stale challenge.

### (3)–(4) Settlement

The caller transfers **at least** `amountAtomic` USDC to `payTo` on `network` by
calling `transfer(address,uint256)` on the network's USDC contract:

| Network        | USDC contract                                |
| -------------- | -------------------------------------------- |
| `base`         | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| `base-sepolia` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |

The caller obtains the transaction hash.

### (5) Retry with proof

The caller repeats the original request, adding a `PaymentProof` as JSON in the
`X-Payment-Proof` header:

```
X-Payment-Proof: {"txHash":"0xabc...","payerWallet":"0xdef..."}
```

### (6) Verification

The provider MUST verify, against on-chain state, that the referenced
transaction:

1. **exists** and has status **success** (not reverted);
2. has **≥ `minConfirmations`** confirmations (default `1`);
3. contains a **USDC `Transfer` log** whose `to` equals `payTo` and whose `value`
   is **≥ `amountAtomic`**.

The provider MUST derive the payer from the transfer's `from` topic rather than
trusting the caller-supplied `payerWallet`. Providers MUST reject a `txHash` that
has already been redeemed (replay protection).

### (7) Result

On successful verification the provider returns the normal `2xx` result. On
failure it returns `402` again (optionally with an `error` field) or `409` if the
proof was already used.

## 4. Object definitions

### PaymentRequirements

| Field          | Type     | Required | Notes                                       |
| -------------- | -------- | -------- | ------------------------------------------- |
| `type`         | string   | yes      | Always `"x402_payment_required"`.           |
| `amount`       | string   | yes      | Human-readable, e.g. `"0.05"`.              |
| `amountAtomic` | string   | yes      | Atomic USDC (6 decimals). Authoritative.    |
| `currency`     | string   | yes      | `"USDC"`.                                   |
| `network`      | string   | yes      | `"base"` or `"base-sepolia"`.               |
| `chainId`      | number   | yes      | `8453` or `84532`.                          |
| `payTo`        | string   | yes      | Recipient EVM address.                      |
| `resource`     | string   | no       | Identifier of the paid resource.            |
| `description`  | string   | no       | Human-readable description.                 |
| `memo`         | string   | no       | Reconciliation hint.                        |
| `expiresAt`    | string   | yes      | ISO-8601 expiry of the challenge.           |

### PaymentProof

| Field         | Type   | Required | Notes                                       |
| ------------- | ------ | -------- | ------------------------------------------- |
| `txHash`      | string | yes      | 32-byte tx hash of the USDC transfer.       |
| `payerWallet` | string | no       | Informational; provider derives the truth.  |
| `paidAt`      | string | no       | Informational ISO-8601 timestamp.           |

## 5. HTTP headers

On the `402` response, providers SHOULD set:

| Header               | Value                       |
| -------------------- | --------------------------- |
| `X-Payment-Required` | `true`                      |
| `X-Payment-Network`  | `base` / `base-sepolia`     |
| `X-Payment-Amount`   | `amountAtomic`              |
| `X-Payment-Currency` | `USDC`                      |
| `X-Payment-Address`  | `payTo`                     |

On the retried request, callers MUST set `X-Payment-Proof` (JSON). They MAY set
`X-Payer-Wallet`.

## 6. Security considerations

- **Replay:** track redeemed `txHash` values; never honor one twice.
- **Underpayment:** compare `value >= amountAtomic` using big integers.
- **Wrong recipient / token:** match both the USDC contract address and `payTo`.
- **Confirmations:** raise `minConfirmations` for higher-value calls to resist
  reorgs.
- **Expiry:** honor `expiresAt` to prevent price-staleness arbitrage.

## 7. Reference implementation

The [`@rail402/x402`](https://github.com/rail402/x402-sdk) SDK implements this
flow for Express, Next.js, and FastAPI, including the on-chain verification in §6.
