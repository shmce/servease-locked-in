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

  it("updates current admin profile and password through shared account endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              id: "admin-1",
              email: "admin@example.com",
              fullName: "Updated Admin",
              contactNumber: "+639170000000",
              role: "admin",
              status: "active",
            },
            customerProfile: null,
            providerProfile: null,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ok: true } }),
      });

    const {
      updateCurrentUserPassword,
      updateCurrentUserProfile,
    } = await import("./serveaseAdminApi");
    const profile = await updateCurrentUserProfile("admin-token", {
      fullName: "Updated Admin",
      contactNumber: "+639170000000",
    });
    const password = await updateCurrentUserPassword("admin-token", {
      currentPassword: "OldPassword#2026",
      newPassword: "NewPassword#2026",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/me",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          fullName: "Updated Admin",
          contactNumber: "+639170000000",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/me/password",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "OldPassword#2026",
          newPassword: "NewPassword#2026",
        }),
      }),
    );
    expect(profile.user.fullName).toBe("Updated Admin");
    expect(password.ok).toBe(true);
  });

  it("loads and saves current user preferences through shared account endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            userId: "admin-1",
            pushNotificationsEnabled: true,
            darkModeEnabled: false,
            language: "en",
            notificationPreferences: { bookingAlerts: true },
            updatedAt: null,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            userId: "admin-1",
            pushNotificationsEnabled: false,
            darkModeEnabled: true,
            language: "fil",
            notificationPreferences: { bookingAlerts: false },
            updatedAt: null,
          },
        }),
      });

    const { getUserPreferences, updateUserPreferences } = await import(
      "./serveaseAdminApi"
    );
    const current = await getUserPreferences("admin-token");
    const updated = await updateUserPreferences("admin-token", {
      pushNotificationsEnabled: false,
      darkModeEnabled: true,
      language: "fil",
      notificationPreferences: { bookingAlerts: false },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/me/preferences",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/me/preferences",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          pushNotificationsEnabled: false,
          darkModeEnabled: true,
          language: "fil",
          notificationPreferences: { bookingAlerts: false },
        }),
      }),
    );
    expect(current.notificationPreferences.bookingAlerts).toBe(true);
    expect(updated.language).toBe("fil");
  });

  it("loads admin disputes through the gateway", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "dispute-1",
            bookingId: "booking-1",
            bookingReference: "SE-ABC123",
            customerId: "customer-1",
            providerId: "provider-1",
            raisedBy: "customer-1",
            reason: "Provider did not arrive",
            status: "open",
            amount: 1500,
            createdAt: null,
          },
        ],
      }),
    });

    const { listAdminDisputes } = await import("./serveaseAdminApi");
    const disputes = await listAdminDisputes("admin-token", "open");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gateway.test/v1/admin/disputes?status=open",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          authorization: "Bearer admin-token",
          accept: "application/json",
        }),
      }),
    );
    expect(disputes[0].id).toBe("dispute-1");
  });

  it("loads and decides provider applications through the gateway", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "provider-1",
              applicationReference: "PA-PROVIDER1",
              userId: "user-1",
              businessName: "GreenFix",
              serviceArea: "Makati",
              serviceDescription: "Home services",
              yearsExperience: 5,
              verificationStatus: "pending",
              isActive: true,
              averageRating: 0,
              reviewCount: 0,
              serviceCount: 1,
              documentCount: 0,
              pendingDocumentCount: 0,
              approvedDocumentCount: 0,
              rejectedDocumentCount: 0,
              latestDecisionReason: null,
              latestDecisionAt: null,
              latestDecidedBy: null,
              createdAt: null,
              updatedAt: null,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "provider-1",
            applicationReference: "PA-PROVIDER1",
            userId: "user-1",
            businessName: "GreenFix",
            serviceArea: "Makati",
            serviceDescription: "Home services",
            yearsExperience: 5,
            verificationStatus: "approved",
            isActive: true,
            averageRating: 0,
            reviewCount: 0,
            serviceCount: 1,
            documentCount: 0,
            pendingDocumentCount: 0,
            approvedDocumentCount: 0,
            rejectedDocumentCount: 0,
            latestDecisionReason: "Approved",
            latestDecisionAt: null,
            latestDecidedBy: "admin-1",
            createdAt: null,
            updatedAt: null,
          },
        }),
      });

    const {
      approveAdminProviderApplication,
      listAdminProviderApplications,
    } = await import("./serveaseAdminApi");
    const applications = await listAdminProviderApplications("admin-token", {
      status: "pending",
      query: "GreenFix",
    });
    const approved = await approveAdminProviderApplication(
      "admin-token",
      "provider-1",
      "Approved",
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/admin/provider-applications?status=pending&query=GreenFix",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/admin/provider-applications/provider-1/approve",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "Approved" }),
      }),
    );
    expect(applications[0].verificationStatus).toBe("pending");
    expect(approved.verificationStatus).toBe("approved");
  });

  it("loads and creates admin promotions through the gateway", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "promo-1",
              code: "SERVEASE10",
              description: "Demo discount",
              discountType: "percent",
              discountValue: 10,
              maxDiscountAmount: 300,
              minOrderAmount: 500,
              startsAt: null,
              endsAt: null,
              isActive: true,
              status: "active",
              createdAt: null,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "promo-2",
            code: "SAVE100",
            description: null,
            discountType: "fixed",
            discountValue: 100,
            maxDiscountAmount: null,
            minOrderAmount: 500,
            startsAt: null,
            endsAt: null,
            isActive: true,
            status: "active",
            createdAt: null,
          },
        }),
      });

    const { createAdminPromotion, listAdminPromotions } = await import(
      "./serveaseAdminApi"
    );
    const promotions = await listAdminPromotions("admin-token", "active");
    const created = await createAdminPromotion("admin-token", {
      code: "SAVE100",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 500,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/admin/promotions?status=active",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/admin/promotions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "SAVE100",
          discountType: "fixed",
          discountValue: 100,
          minOrderAmount: 500,
        }),
      }),
    );
    expect(promotions[0].code).toBe("SERVEASE10");
    expect(created.id).toBe("promo-2");
  });

  it("loads and decides admin refunds through the gateway", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "refund-1",
              paymentId: "payment-1",
              bookingId: "booking-1",
              customerId: "customer-1",
              providerId: "provider-1",
              amount: 1500,
              reason: "Customer requested review",
              status: "requested",
              requestedAt: null,
              decidedBy: null,
              decisionReason: null,
              decidedAt: null,
              processedAt: null,
              createdAt: null,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "refund-1",
            paymentId: "payment-1",
            bookingId: "booking-1",
            customerId: "customer-1",
            providerId: "provider-1",
            amount: 1500,
            reason: "Customer requested review",
            status: "approved",
            requestedAt: null,
            decidedBy: "admin-1",
            decisionReason: "Approved",
            decidedAt: null,
            processedAt: null,
            createdAt: null,
          },
        }),
      });

    const { approveAdminRefund, listAdminRefunds } = await import(
      "./serveaseAdminApi"
    );
    const refunds = await listAdminRefunds("admin-token", "requested");
    const approved = await approveAdminRefund(
      "admin-token",
      "refund-1",
      "Approved",
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/admin/refunds?status=requested",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/admin/refunds/refund-1/approve",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "Approved" }),
      }),
    );
    expect(refunds[0].status).toBe("requested");
    expect(approved.status).toBe("approved");
  });

  it("loads and updates commission rules through the gateway", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "platform-default",
              categoryKey: "platform-default",
              categoryLabel: "Platform Default",
              currentRate: 15,
              previousRate: 15,
              status: "active",
              monthlyRevenue: 0,
              monthlyCommission: 0,
              updatedBy: null,
              updatedAt: null,
              createdAt: null,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "platform-default",
            categoryKey: "platform-default",
            categoryLabel: "Platform Default",
            currentRate: 16,
            previousRate: 15,
            status: "active",
            monthlyRevenue: 0,
            monthlyCommission: 0,
            updatedBy: "admin-1",
            updatedAt: null,
            createdAt: null,
          },
        }),
      });

    const { listAdminCommissionRules, updateAdminCommissionRule } = await import(
      "./serveaseAdminApi"
    );
    const rules = await listAdminCommissionRules("admin-token");
    const updated = await updateAdminCommissionRule(
      "admin-token",
      "platform-default",
      { currentRate: 16, status: "active" },
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/admin/commission-rules",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/admin/commission-rules/platform-default",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ currentRate: 16, status: "active" }),
      }),
    );
    expect(rules[0].currentRate).toBe(15);
    expect(updated.currentRate).toBe(16);
  });

  it("resolves admin disputes through the gateway", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "dispute-1",
          bookingId: "booking-1",
          bookingReference: "SE-ABC123",
          customerId: "customer-1",
          providerId: "provider-1",
          raisedBy: "customer-1",
          reason: "Provider did not arrive",
          status: "resolved",
          amount: 1500,
          createdAt: null,
        },
      }),
    });

    const { resolveAdminDispute } = await import("./serveaseAdminApi");
    const dispute = await resolveAdminDispute("admin-token", "dispute-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://gateway.test/v1/admin/disputes/dispute-1/resolve",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer admin-token",
          accept: "application/json",
        }),
      }),
    );
    expect(dispute.status).toBe("resolved");
  });

  it("loads and exports admin audit logs through the gateway", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "audit-1",
              adminUserId: "admin-1",
              adminEmail: "admin@example.com",
              adminName: "Admin User",
              action: "Updated payment status to paid",
              actionType: "update",
              entityType: "Payment",
              entityId: "payment-1",
              details: "Payment payment-1 is now paid.",
              ipAddress: "127.0.0.1",
              metadata: {},
              createdAt: "2026-05-16T00:00:00.000Z",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "id,entityType\naudit-1,Payment",
      });

    const { exportAdminAuditLogsCsv, listAdminAuditLogs } = await import(
      "./serveaseAdminApi"
    );
    const logs = await listAdminAuditLogs("admin-token", {
      actionType: "update",
      entityType: "Payment",
      limit: 50,
    });
    const csv = await exportAdminAuditLogsCsv("admin-token", { limit: 50 });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://gateway.test/v1/admin/audit-logs?actionType=update&entityType=Payment&limit=50",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://gateway.test/v1/admin/audit-logs/export?limit=50",
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: "text/csv",
          authorization: "Bearer admin-token",
        }),
      }),
    );
    expect(logs[0].entityType).toBe("Payment");
    expect(csv).toContain("audit-1");
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
