import { beforeEach, describe, expect, it, vi } from "vitest";

const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: toastError,
  },
}));

describe("notifyBackendRequired", () => {
  beforeEach(() => {
    toastError.mockReset();
  });

  it("shows the missing backend endpoint instead of a fake success", async () => {
    const { notifyBackendRequired } = await import("./backendRequired");

    notifyBackendRequired("Approving refunds", "POST /v1/admin/refunds/:id/approve");

    expect(toastError).toHaveBeenCalledWith("Approving refunds needs backend support", {
      description: "Required endpoint: POST /v1/admin/refunds/:id/approve",
    });
  });

  it("uses a generic message when no endpoint is known yet", async () => {
    const { notifyBackendRequired } = await import("./backendRequired");

    notifyBackendRequired("Exporting reports");

    expect(toastError).toHaveBeenCalledWith("Exporting reports needs backend support", {
      description: "No backend endpoint is available for this action yet.",
    });
  });
});
