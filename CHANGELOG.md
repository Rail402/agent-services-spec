# Changelog

All notable changes to the Agent Services Discovery specification are documented
here. The spec follows [Semantic Versioning](https://semver.org): the `version`
field in a discovery document is `MAJOR.MINOR`.

## [1.0] — 2026-06-01

Initial stable release.

### Added
- `agent-services-schema.json` — JSON Schema (2020-12) for
  `/.well-known/agent-services.json`, covering `provider`, `services`, per-service
  `price`, `inputSchema`, and `outputSchema`.
- `spec/x402-flow.md` — normative description of the HTTP 402 payment handshake,
  `PaymentRequirements` / `PaymentProof` objects, verification rules, and headers.
- `spec/llms-txt-format.md` — paid-API profile of `llms.txt` and its relationship
  to the machine-readable document.
- `examples/` — `single-service`, `multi-service`, and `no-input-service` documents.
- `@rail402/validate-spec` CLI validator.

### Notes
- Settlement is fixed to **USDC** on **Base** (`base`, `base-sepolia`) in 1.0.
  Additional currencies/networks are reserved for a future MINOR/MAJOR bump.
