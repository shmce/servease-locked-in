import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin map previews", () => {
  it("renders service area coverage preview instead of placeholder copy", () => {
    const serviceAreasSource = readFileSync(join(process.cwd(), "src/app/pages/ServiceAreas.tsx"), "utf8");

    expect(serviceAreasSource).toContain("Metro Manila coverage");
    expect(serviceAreasSource).toContain("getCoveragePoint");
    expect(serviceAreasSource).not.toContain("Interactive Map Coming Soon");
    expect(serviceAreasSource).not.toContain("Map view placeholder");
  });
});
