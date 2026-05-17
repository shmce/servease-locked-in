import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Profile page current-user integration", () => {
  it("hydrates profile details from the shared current-user gateway endpoint", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/pages/Profile.tsx"),
      "utf8",
    );

    expect(source).toContain("getCurrentUser");
    expect(source).toContain("getCurrentUser(accessToken)");
    expect(source).not.toContain('email: admin?.email ?? "admin@servease.ph"');
  });
});
