import type {
  AdminBookingsSummaryStats,
  AdminDisputeStatus,
  AdminPayoutStatus,
  AdminUsersSummaryStats,
} from "../../services/serveaseAdminApi";

interface DashboardLiveMetricsInput {
  bookingsSummary: AdminBookingsSummaryStats | null;
  payouts: Array<{ status: AdminPayoutStatus }>;
  disputes: Array<{ status: AdminDisputeStatus }>;
  usersSummary: AdminUsersSummaryStats | null;
}

export interface DashboardLiveMetrics {
  activeBookingsToday: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingPayouts: number;
  openDisputes: number;
  totalUsers: number;
  activeUsers: number;
}

export function buildDashboardLiveMetrics(
  input: DashboardLiveMetricsInput,
): DashboardLiveMetrics {
  const byStatus = input.bookingsSummary?.byStatus;

  return {
    activeBookingsToday: (byStatus?.confirmed ?? 0) + (byStatus?.in_progress ?? 0),
    completedBookings: byStatus?.completed ?? 0,
    cancelledBookings: byStatus?.cancelled ?? 0,
    pendingPayouts: input.payouts.filter(
      (payout) => payout.status === "requested" || payout.status === "processing",
    ).length,
    openDisputes: input.disputes.filter((dispute) => dispute.status === "open").length,
    totalUsers: input.usersSummary?.totalCount ?? 0,
    activeUsers: input.usersSummary?.byStatus.active ?? 0,
  };
}
