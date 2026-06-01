import Ajv2020, { type ErrorObject } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../../spec/agent-services-schema.json" with { type: "json" };

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  /** Non-fatal advisories that don't break the schema but hurt agent UX. */
  warnings: string[];
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateFn = ajv.compile(schema);

function formatError(e: ErrorObject): string {
  const path = e.instancePath || "(root)";
  if (e.keyword === "required" && "missingProperty" in (e.params as object)) {
    return `${path}: missing required property "${(e.params as { missingProperty: string }).missingProperty}"`;
  }
  if (e.keyword === "additionalProperties" && "additionalProperty" in (e.params as object)) {
    return `${path}: unexpected property "${(e.params as { additionalProperty: string }).additionalProperty}"`;
  }
  return `${path}: ${e.message ?? "is invalid"}`;
}

/** Validate a parsed agent-services document against the spec schema. */
export function validateDocument(doc: unknown): ValidationResult {
  const valid = validateFn(doc) as boolean;
  const errors = valid ? [] : (validateFn.errors ?? []).map(formatError);
  const warnings = valid ? collectWarnings(doc) : [];
  return { valid, errors, warnings };
}

/** Soft checks that improve agent discoverability but aren't schema errors. */
function collectWarnings(doc: unknown): string[] {
  const out: string[] = [];
  const d = doc as { services?: Array<Record<string, unknown>> };
  for (const [i, svc] of (d.services ?? []).entries()) {
    const at = `services[${i}] "${svc.id ?? "?"}"`;
    if (!svc.description) out.push(`${at}: no description — agents rank described services higher.`);
    if (!svc.exampleRequest) out.push(`${at}: no exampleRequest — agents use examples to form calls.`);
    if (!svc.exampleResponse) out.push(`${at}: no exampleResponse.`);
    const endpoint = svc.endpoint;
    if (typeof endpoint === "string" && endpoint.startsWith("http://")) {
      out.push(`${at}: endpoint uses http:// — production endpoints should be https://.`);
    }
  }
  return out;
}

export { schema };
