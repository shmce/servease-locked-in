// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingAnalytics } from "./BookingAnalytics";

vi.mock("../../../hooks/useAdminGatewayData", () => ({
  useAdminGatewayData: () => ({
    payments: [
      {
        id: "payment-new",
        bookingId: "booking-new",
        customerId: "customer-new",
        providerId: "provider-new",
        amount: 2000,
        platformFee: 200,
        providerPayout: 1800,
        status: "paid",
        paymentMethod: "gcash",
        paidAt: "2026-05-22T00:00:00.000Z",
        createdAt: "2026-05-22T00:00:00.000Z",
      },
      {
        id: "payment-old",
        bookingId: "booking-old",
        customerId: "customer-old",
        providerId: "provider-old",
        amount: 1000,
        platformFee: 100,
        providerPayout: 900,
        status: "paid",
        paymentMethod: "cash_on_service",
        paidAt: "2026-05-20T00:00:00.000Z",
        createdAt: "2026-05-20T00:00:00.000Z",
      },
    ],
    isLoading: false,
  }),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ accessToken: "admin-token" }),
}));

vi.mock("../../../services/serveaseAdminApi", () => ({
  exportAdminBookingsCsv: vi.fn(),
  exportAdminReportPdf: vi.fn(),
}));

vi.mock("recharts", () => {
  const Chart = ({
    children,
    data,
  }: {
    children?: React.ReactNode;
    data?: unknown;
  }) => {
    const isBookingsChart =
      Array.isArray(data) &&
      data.every(
        (point) => typeof point === "object" && point !== null && "bookings" in point,
      );

    return (
      <div
        data-chart-data={data ? JSON.stringify(data) : undefined}
        data-testid={isBookingsChart ? "bookings-over-time-chart" : undefined}
      >
        {children}
      </div>
    );
  };

  return {
    LineChart: Chart,
    Line: () => null,
    PieChart: Chart,
    Pie: Chart,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: Chart,
  };
});

describe("Booking analytics page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders bookings over time from past to present", () => {
    render(<BookingAnalytics />);

    expect(screen.getByText("Bookings Over Time")).toBeInTheDocument();
    const chart = screen.getByTestId("bookings-over-time-chart");
    const chartData = JSON.parse(chart?.getAttribute("data-chart-data") ?? "[]");

    expect(chartData.map((point: { date: string }) => point.date)).toEqual([
      "2026-05-20",
      "2026-05-22",
    ]);
  });
});
