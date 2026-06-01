import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateDocument } from "../src/validate.js";

const here = dirname(fileURLToPath(import.meta.url));
const example = (name: string) =>
  JSON.parse(readFileSync(resolve(here, "../../examples", name), "utf8"));

describe("validateDocument", () => {
  it("accepts the single-service example", () => {
    const res = validateDocument(example("single-service.json"));
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("accepts the multi-service example", () => {
    expect(validateDocument(example("multi-service.json")).valid).toBe(true);
  });

  it("accepts the no-input example", () => {
    expect(validateDocument(example("no-input-service.json")).valid).toBe(true);
  });

  it("rejects a document missing the provider", () => {
    const res = validateDocument({ version: "1.0", services: [] });
    expect(res.valid).toBe(false);
    expect(res.errors.join(" ")).toMatch(/provider/);
  });

  it("rejects a service with an invalid price amount", () => {
    const doc = {
      version: "1.0",
      provider: { name: "X" },
      services: [
        {
          id: "x",
          name: "X",
          endpoint: "https://x.example.com/api",
          method: "POST",
          price: { amount: "free", currency: "USDC", network: "base" },
          inputSchema: {},
          outputSchema: {},
        },
      ],
    };
    expect(validateDocument(doc).valid).toBe(false);
  });

  it("rejects an unsupported currency", () => {
    const doc = {
      version: "1.0",
      provider: { name: "X" },
      services: [
        {
          id: "x",
          name: "X",
          endpoint: "https://x.example.com/api",
          method: "POST",
          price: { amount: "1", currency: "ETH", network: "base" },
          inputSchema: {},
          outputSchema: {},
        },
      ],
    };
    expect(validateDocument(doc).valid).toBe(false);
  });

  it("warns about http:// endpoints without failing", () => {
    const doc = {
      version: "1.0",
      provider: { name: "X" },
      services: [
        {
          id: "x",
          name: "X",
          description: "d",
          endpoint: "http://x.example.com/api",
          method: "POST",
          price: { amount: "1", currency: "USDC", network: "base" },
          inputSchema: {},
          outputSchema: {},
          exampleRequest: {},
          exampleResponse: {},
        },
      ],
    };
    const res = validateDocument(doc);
    expect(res.valid).toBe(true);
    expect(res.warnings.join(" ")).toMatch(/http:\/\//);
  });
});
