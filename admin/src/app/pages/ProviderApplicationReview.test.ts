import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ProviderApplicationReview", () => {
  it("does not use random simulated verification for KYC decisions", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/pages/ProviderApplicationReview.tsx"),
      "utf8",
    );

    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("simulateVerify");
  });
});
