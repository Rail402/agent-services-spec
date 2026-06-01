# Agent Services Discovery Spec

[![Spec version](https://img.shields.io/badge/spec-1.0-0052FF.svg)](./CHANGELOG.md)
[![Validator](https://img.shields.io/npm/v/@rail402/validate-spec.svg?label=validator)](https://www.npmjs.com/package/@rail402/validate-spec)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

The open specification for **machine-readable paid-API discovery** — how an AI
agent finds an API, learns its price and schema, and pays for it autonomously.

Authored and maintained by [Rail402](https://rail402.app), and free for anyone to
adopt. Rail402's marketplace both publishes and consumes documents in this format.

## The standard in one picture

```
                        ┌────────────────────────────────────────────┐
  Agent reads ───────▶  │  /llms.txt                                  │  human/LLM map
                        │  /.well-known/agent-services.json           │  authoritative catalog
                        └────────────────────────────────────────────┘
                                          │
                          selects a service, reads its schema
                                          ▼
                        ┌────────────────────────────────────────────┐
  Agent pays ────────▶  │  x402 flow: 402 → pay USDC on Base → retry  │
                        └────────────────────────────────────────────┘
```

## Why this matters

APIs were built for humans with API keys and credit cards. Agents have neither.
This spec defines a **keyless, accountless** discovery + payment contract so any
agent can go from "I need wallet-risk data" to a paid result without a human:

- **Discoverable** — a standard location (`/.well-known/agent-services.json`) and
  a stable JSON Schema mean an agent can enumerate paid APIs across any provider.
- **Self-describing** — every service ships its `inputSchema`, `outputSchema`,
  and examples, so an agent can form a valid call unassisted.
- **Self-settling** — pricing is declared inline and paid via the
  [x402 flow](./spec/x402-flow.md) in USDC on Base. No keys, no invoices.

## Contents

| Path                                                | What it is                                            |
| --------------------------------------------------- | ----------------------------------------------------- |
| [`spec/agent-services-schema.json`](./spec/agent-services-schema.json) | JSON Schema (2020-12) for the discovery document. |
| [`spec/x402-flow.md`](./spec/x402-flow.md)          | Normative HTTP 402 payment handshake.                 |
| [`spec/llms-txt-format.md`](./spec/llms-txt-format.md) | Paid-API profile of `llms.txt`.                    |
| [`examples/`](./examples)                           | Valid example documents you can copy.                 |
| [`validator/`](./validator)                         | `@rail402/validate-spec` CLI + library.               |
| [`CHANGELOG.md`](./CHANGELOG.md)                    | Versioned spec history.                               |

## Adopt it in 3 steps

1. **Publish** a document at `/.well-known/agent-services.json`. Start from
   [`examples/single-service.json`](./examples/single-service.json).
2. **Validate** it:
   ```bash
   npx @rail402/validate-spec ./agent-services.json
   ```
3. **Make endpoints x402-payable** with the
   [`@rail402/x402`](https://github.com/rail402/x402-sdk) SDK, and add an
   [`llms.txt`](./spec/llms-txt-format.md) breadcrumb.

That's it — your APIs are now discoverable and payable by any compliant agent,
including everything in the Rail402 marketplace.

## Document at a glance

```json
{
  "version": "1.0",
  "provider": { "name": "Acme Risk Labs", "wallet": "0x1111...1111" },
  "services": [
    {
      "id": "wallet-risk-score",
      "name": "Wallet Risk Score",
      "endpoint": "https://acme-risk.example.com/api/risk",
      "method": "POST",
      "price": { "amount": "0.05", "currency": "USDC", "network": "base" },
      "inputSchema":  { "type": "object", "required": ["address"], "properties": { "address": { "type": "string" } } },
      "outputSchema": { "type": "object", "properties": { "score": { "type": "number" } } }
    }
  ]
}
```

## Versioning

The spec uses `MAJOR.MINOR`. Backwards-compatible additions bump MINOR;
breaking changes bump MAJOR. Documents declare the version they target via the
top-level `version` field. See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

Propose changes via PR against `spec/`. Requirements:

1. Any schema change updates `examples/` and the validator tests (`cd validator && npm test`).
2. Normative wording uses RFC-2119 keywords (MUST/SHOULD/MAY).
3. Breaking changes include a CHANGELOG entry and a MAJOR version note.

## License

MIT © Rail402
