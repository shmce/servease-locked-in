import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin map previews", () => {
  it("renders service area and provider location previews instead of placeholder copy", () => {
    const serviceAreasSource = readFileSync(join(process.cwd(), "src/app/pages/ServiceAreas.tsx"), "utf8");
    const providerDrawerSource = readFileSync(
      join(process.cwd(), "src/app/components/ProviderDetailsDrawer.tsx"),
      "utf8",
    );

    expect(serviceAreasSource).toContain("Metro Manila coverage");
    expect(serviceAreasSource).toContain("getCoveragePoint");
    expect(providerDrawerSource).toContain("Approximate service area");
    expect(providerDrawerSource).toContain("getProviderMapPoint");
    expect(`${serviceAreasSource}\n${providerDrawerSource}`).not.toContain("Interactive Map Coming Soon");
    expect(`${serviceAreasSource}\n${providerDrawerSource}`).not.toContain("Map view placeholder");
  });
});
