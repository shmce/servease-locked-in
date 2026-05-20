// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Transactions } from "./Transactions";

const mocks = vi.hoisted(() => ({
  listAdminPayments: vi.fn(),
  listAdminPayouts: vi.fn(),
  releaseAdminPaymentToProvider: vi.fn(),
  syncAdminPaymentWithApicenter: vi.fn(),
  updateAdminPaymentStatus: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ accessToken: "admin-token" }),
}));

vi.mock("../../services/serveaseAdminApi", () => ({
  listAdminPayments: mocks.listAdminPayments,
  listAdminPayouts: mocks.listAdminPayouts,
  releaseAdminPaymentToProvider: mocks.releaseAdminPaymentToProvider,
  syncAdminPaymentWithApicenter: mocks.syncAdminPaymentWithApicenter,
  updateAdminPaymentStatus: mocks.updateAdminPaymentStatus,
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

describe("Transactions page", () => {
  beforeEach(() => {
    mocks.listAdminPayments.mockResolvedValue([
      {
        id: "payment-releaseable",
        bookingId: "booking-1",
        customerId: "customer-1",
        providerId: "provider-1",
        amount: 1000,
        platformFee: 150,
        providerPayout: 850,
        status: "paid",
        paymentMethod: "gcash",
        paidAt: "2026-05-21T00:00:00.000Z",
        createdAt: "2026-05-21T00:00:00.000Z",
        failureReason: null,
        failureCode: null,
        retryCount: 0,
        lastRetryAt: null,
        disputeId: null,
        apicenterCheckoutId: "checkout-1",
        apicenterCheckoutStatus: "paid",
        apicenterProvider: "paymongo",
        apicenterProviderMode: "test",
      },
      {
        id: "payment-released",
        bookingId: "booking-2",
        customerId: "customer-2",
        providerId: "provider-2",
        amount: 2000,
        platformFee: 300,
        providerPayout: 1700,
        status: "paid",
        paymentMethod: "cash_on_service",
        paidAt: "2026-05-21T00:00:00.000Z",
        createdAt: "2026-05-21T00:00:00.000Z",
        failureReason: null,
        failureCode: null,
        retryCount: 0,
        lastRetryAt: null,
        disputeId: null,
        apicenterCheckoutId: null,
        apicenterCheckoutStatus: null,
        apicenterProvider: null,
        apicenterProviderMode: null,
      },
    ]);
    mocks.listAdminPayouts.mockResolvedValue([
      {
        id: "payout-1",
        paymentId: "payment-released",
        providerId: "provider-2",
        amount: 1700,
        processingFee: 10,
        netAmount: 1690,
        status: "processing",
        payoutMethodId: "method-1",
        methodType: "gcash",
        accountLabel: "GCash",
        reference: "PO-TEST",
        periodStart: null,
        periodEnd: null,
        requestedAt: null,
        paidAt: null,
        createdAt: null,
      },
    ]);
    mocks.releaseAdminPaymentToProvider.mockResolvedValue({
      id: "payout-2",
      paymentId: "payment-releaseable",
      providerId: "provider-1",
      amount: 850,
      processingFee: 10,
      netAmount: 840,
      status: "processing",
      payoutMethodId: "method-2",
      methodType: "gcash",
      accountLabel: "GCash",
      reference: "PO-NEW",
      periodStart: null,
      periodEnd: null,
      requestedAt: null,
      paidAt: null,
      createdAt: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows release action only for paid payments that are not already released", async () => {
    const user = userEvent.setup();
    render(<Transactions />);

    await waitFor(() => {
      expect(screen.getByText("payment-releaseable")).toBeInTheDocument();
    });
    expect(screen.getByText("Released")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Release" }));
    expect(screen.getByText("Release payment to provider?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Release Payment" }));

    await waitFor(() => {
      expect(mocks.releaseAdminPaymentToProvider).toHaveBeenCalledWith(
        "admin-token",
        "payment-releaseable",
        "Released from admin transactions.",
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Payment released as payout PO-NEW.",
    );
  });
});
