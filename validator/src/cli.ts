#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateDocument } from "./validate.js";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

async function main() {
  const target = process.argv[2];
  if (!target || target === "-h" || target === "--help") {
    console.log(`Usage: validate-spec <path-to-agent-services.json>

Validates a /.well-known/agent-services.json document against the
Rail402 Agent Services Discovery spec.

Examples:
  npx @rail402/validate-spec ./agent-services.json
  npx @rail402/validate-spec ./examples/single-service.json`);
    process.exit(target ? 0 : 1);
  }

  const path = resolve(process.cwd(), target);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    console.error(`${RED}✖${RESET} Could not read file: ${path}`);
    process.exit(1);
  }

  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    console.error(`${RED}✖${RESET} Invalid JSON: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }

  const { valid, errors, warnings } = validateDocument(doc);

  if (warnings.length) {
    console.log(`${YELLOW}⚠ ${warnings.length} warning(s):${RESET}`);
    for (const w of warnings) console.log(`  ${DIM}-${RESET} ${w}`);
    console.log();
  }

  if (valid) {
    console.log(`${GREEN}✔ Valid${RESET} — ${path} conforms to the Agent Services spec.`);
    process.exit(0);
  }

  console.error(`${RED}✖ Invalid${RESET} — ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${RED}-${RESET} ${e}`);
  process.exit(1);
}

main();
