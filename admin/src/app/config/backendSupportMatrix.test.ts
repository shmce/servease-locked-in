import { describe, expect, it } from "vitest";
import { backendSupportMatrix } from "./backendSupportMatrix";

describe("backendSupportMatrix", () => {
  it("tracks every admin capability with ownership details", () => {
    expect(backendSupportMatrix.length).toBeGreaterThanOrEqual(10);

    for (const item of backendSupportMatrix) {
      expect(item.area).toBeTruthy();
      expect(item.screen).toBeTruthy();
      expect(item.currentSupport).toBeTruthy();
      expect(item.notes).toBeTruthy();
      expect(item.status).toBe("wired");
    }
  });

  it("does not advertise incomplete capabilities in the matrix", () => {
    for (const item of backendSupportMatrix) {
      expect(item.backendNeeded).toEqual([]);
      expect(item.currentSupport.toLowerCase()).not.toContain("frontend-only");
      expect(item.currentSupport.toLowerCase()).not.toContain("local-only");
    }
  });

  it("documents the currently wired gateway contracts", () => {
    const endpoints = backendSupportMatrix.flatMap((item) => item.existingEndpoints);

    expect(endpoints).toContain("GET /v1/me");
    expect(endpoints).toContain("GET /v1/admin/payments");
    expect(endpoints).toContain("GET /v1/admin/payments/:paymentId");
    expect(endpoints).toContain("PATCH /v1/admin/payments/:paymentId/status");
    expect(endpoints).toContain("GET /v1/admin/support/tickets");
    expect(endpoints).toContain("GET /v1/admin/support/tickets/:ticketId");
    expect(endpoints).toContain("PATCH /v1/admin/support/tickets/:ticketId/status");
    expect(endpoints).toContain("GET /v1/admin/bookings/summary");
    expect(endpoints).toContain("GET /v1/catalog/categories");
    expect(endpoints).toContain("GET /v1/catalog/services");
    expect(endpoints).toContain("GET /v1/catalog/providers");
  });
});
