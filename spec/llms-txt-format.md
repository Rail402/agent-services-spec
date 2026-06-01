# `llms.txt` for Paid APIs

**Status:** Stable · **Version:** 1.0

[`llms.txt`](https://llmstxt.org) is a plain-text/Markdown file at a site's root
that gives LLMs a concise, curated map of a site. This document specifies a
**paid-API profile** of `llms.txt`: conventions a provider follows so an agent
reading `https://<host>/llms.txt` can discover paid endpoints and learn how to
pay for them via x402.

`llms.txt` is the **human/LLM-readable** companion to the
**machine-readable** `/.well-known/agent-services.json`. The two SHOULD agree.

## Location

```
https://<host>/llms.txt
```

Served as `text/plain; charset=utf-8` or `text/markdown`.

## Required structure

1. An H1 with the provider name.
2. A blockquote one-line summary.
3. A short prose section (optional but recommended).
4. A section titled **`## Paid APIs`** (or `## API`) listing each paid endpoint
   as a Markdown link followed by `: ` and a description.
5. A link to the machine-readable discovery document and the payment protocol.

## Conventions for paid endpoints

Each paid API link SHOULD encode the essentials inline so an LLM that only reads
text can still reason about cost:

```
- [Service Name](https://host/api/path): one-line description. Price: 0.05 USDC on base. Method: POST.
```

The authoritative schema, examples, and exact price live in
`agent-services.json`; `llms.txt` is the discovery breadcrumb.

## Template

```markdown
# Acme Risk Labs

> Paid on-chain risk and analytics APIs for AI agents, settled in USDC on Base.

Acme exposes pay-per-call APIs using the x402 protocol. Agents discover machine-
readable schemas at /.well-known/agent-services.json and pay per request — no
API keys, no accounts.

## Paid APIs

- [Wallet Risk Score](https://acme-risk.example.com/api/risk): 0–1 risk score for an EVM wallet. Price: 0.05 USDC on base. Method: POST.
- [Token Analytics](https://acme-risk.example.com/api/token): holder, liquidity, and sentiment data for a Base token. Price: 0.05 USDC on base. Method: GET.

## Discovery & Payment

- [agent-services.json](https://acme-risk.example.com/.well-known/agent-services.json): machine-readable catalog (schemas, prices, examples).
- [x402 payment flow](https://github.com/rail402/agent-services-spec/blob/main/spec/x402-flow.md): how to pay and retry.

## Optional

- [Terms](https://acme-risk.example.com/terms): usage terms.
```

## Agent reading algorithm (informative)

1. Fetch `/llms.txt`. If a `## Paid APIs` section exists, the site offers paid endpoints.
2. Fetch the linked `agent-services.json` for authoritative schemas and prices.
3. Select a service, construct a request from its `inputSchema` / `exampleRequest`.
4. Call it; on `402`, follow the [x402 flow](./x402-flow.md) to pay and retry.

## Relationship to `/.well-known/agent-services.json`

| Aspect         | `llms.txt`               | `agent-services.json`        |
| -------------- | ------------------------ | ---------------------------- |
| Audience       | LLMs / humans            | Programmatic agents          |
| Format         | Markdown                 | JSON (schema-validated)      |
| Authority      | Discovery breadcrumb     | Authoritative (price/schema) |
| Location       | `/llms.txt`              | `/.well-known/agent-services.json` |

Providers SHOULD publish both. When they disagree, `agent-services.json` wins.
