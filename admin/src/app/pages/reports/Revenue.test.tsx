// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Revenue } from "./Revenue";

const mocks = vi.hoisted(() => ({
  exportAdminRevenueCsv: vi.fn(),
}));

vi.mock("../../../hooks/useAdminGatewayData", () => ({
  useAdminGatewayData: () => ({
    payments: [
      {
        id: "payment-1",
        bookingId: "booking-1",
        amount: 1500,
        platformFee: 150,
        providerPayout: 1350,
        status: "paid",
        paymentMethod: "gcash",
        paidAt: "2026-05-17T00:00:00.000Z",
        createdAt: "2026-05-17T00:00:00.000Z",
      },
    ],
  }),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ accessToken: "admin-token" }),
}));

vi.mock("../../../services/serveaseAdminApi", () => ({
  exportAdminRevenueCsv: mocks.exportAdminRevenueCsv,
}));

vi.mock("recharts", () => {
  const Chart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    LineChart: Chart,
    Line: () => null,
    BarChart: Chart,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: Chart,
  };
});

describe("Revenue reports page", () => {
  beforeEach(() => {
    mocks.exportAdminRevenueCsv.mockReset();
    mocks.exportAdminRevenueCsv.mockResolvedValue("paymentId,amount\npayment-1,1500");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:revenue-csv"),
        revokeObjectURL: vi.fn(),
      }),
    );
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("exports revenue CSV through the admin gateway", async () => {
    const user = userEvent.setup();
    render(<Revenue />);

    await user.click(screen.getByRole("button", { name: /export csv/i }));

    expect(mocks.exportAdminRevenueCsv).toHaveBeenCalledWith("admin-token");
  });
});
