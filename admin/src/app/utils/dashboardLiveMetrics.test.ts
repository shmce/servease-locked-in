import { describe, expect, it } from "vitest";
import { buildDashboardLiveMetrics } from "./dashboardLiveMetrics";

describe("buildDashboardLiveMetrics", () => {
  it("derives dashboard operations metrics from gateway-shaped data", () => {
    const metrics = buildDashboardLiveMetrics({
      bookingsSummary: {
        totalCount: 12,
        byStatus: {
          pending: 2,
          confirmed: 3,
          in_progress: 1,
          completed: 5,
          cancelled: 1,
          rejected: 0,
        },
        totalRevenue: 12500,
        recentCount: 4,
      },
      payouts: [
        { status: "requested" },
        { status: "processing" },
        { status: "paid" },
      ],
      disputes: [
        { status: "open" },
        { status: "resolved" },
        { status: "closed" },
      ],
      usersSummary: {
        totalCount: 42,
        byRole: { customer: 30, provider: 10, admin: 2 },
        byStatus: { active: 38, suspended: 3, inactive: 1 },
        recentCount: 5,
        newThisMonth: 8,
      },
    });

    expect(metrics).toEqual({
      activeBookingsToday: 4,
      completedBookings: 5,
      cancelledBookings: 1,
      pendingPayouts: 2,
      openDisputes: 1,
      totalUsers: 42,
      activeUsers: 38,
    });
  });
});
