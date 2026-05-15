import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("serveaseAdminApi", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://gateway.test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://supabase.test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";
  });

  it("signs in with Supabase password auth and returns a normalized session", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "token-123",
        refresh_token: "refresh-123",
        expires_in: 3600,
        token_type: "bearer",
        user: { id: "user-1", email: "admin@example.com" },
      }),
    });

    const { signInWithPassword } = await import("./serveaseAdminApi");
    const session = await signInWithPassword(" admin@example.com ", "password");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://supabase.test/auth/v1/token?grant_type=password",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: "public-key",
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password",
        }),
      }),
    );
    expect(session).toEqual({
      accessToken: "token-123",
      refreshToken: "refresh-123",
      expiresIn: 3600,
      tokenType: "bearer",
      user: { id: "user-1", email: "admin@example.com" },
    });
  });

  it("sends gateway bearer tokens and unwraps data payloads", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "pay-1",
            bookingId: "booking-1",
            customerId: null,
            providerId: null,
            amount: 1000,
            platformFee: 100,
            providerPayout: 900,
            status: "paid",
            paymentMethod: "card",
            paidAt: null,
            createdAt: null,
          },
        ],
      }),
    });

    const { listAdminPayments } = await import("./serveaseAdminApi");
    const payments = await listAdminPayments("admin-token", "paid");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gateway.test/v1/admin/payments?status=paid",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: "Bearer admin-token",
          accept: "application/json",
        }),
      }),
    );
    expect(payments).toHaveLength(1);
    expect(payments[0].id).toBe("pay-1");
  });

  it("raises gateway error messages from structured error payloads", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: { code: "FORBIDDEN", message: "Admins only" },
      }),
    });

    const { listAdminSupportTickets } = await import("./serveaseAdminApi");

    await expect(listAdminSupportTickets("customer-token")).rejects.toThrow("Admins only");
  });
});
