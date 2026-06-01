# @rail402/validate-spec

[![npm](https://img.shields.io/npm/v/@rail402/validate-spec.svg)](https://www.npmjs.com/package/@rail402/validate-spec)

CLI + library that validates an `agent-services.json` discovery document against
the [Rail402 Agent Services spec](https://github.com/rail402/agent-services-spec).

## CLI

```bash
npx @rail402/validate-spec ./agent-services.json
```

Exit code `0` if valid, `1` if not. Prints schema errors and soft warnings
(missing descriptions/examples, `http://` endpoints).

## Library

```ts
import { validateDocument } from "@rail402/validate-spec";

const { valid, errors, warnings } = validateDocument(doc);
```

## Develop

```bash
npm install
npm test
npm run build
```

MIT © Rail402
