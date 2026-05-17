import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";
import {
  getAdminBookingsSummary,
  getAdminOperationsAlerts,
  getAdminUsersSummary,
  listAdminDisputes,
  listAdminPayments,
  listAdminPayouts,
  listAdminSupportTickets,
  listAdminUsers,
  listCatalogCategories,
  listCatalogServices,
  listProviderListings,
  type AdminBookingsSummaryStats,
  type AdminDisputeSummary,
  type AdminOperationsAlerts,
  type AdminPaymentSummary,
  type AdminPayoutSummary,
  type AdminSupportTicketSummary,
  type AdminUserSummary,
  type AdminUsersSummaryStats,
  type CatalogCategory,
  type CatalogServiceItem,
  type ProviderServiceListing,
} from "../services/serveaseAdminApi";

interface AdminGatewayData {
  payments: AdminPaymentSummary[];
  payouts: AdminPayoutSummary[];
  disputes: AdminDisputeSummary[];
  supportTickets: AdminSupportTicketSummary[];
  adminUsers: AdminUserSummary[];
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  providerListings: ProviderServiceListing[];
  bookingsSummary: AdminBookingsSummaryStats | null;
  usersSummary: AdminUsersSummaryStats | null;
  operationsAlerts: AdminOperationsAlerts | null;
}

type LoadKey = keyof AdminGatewayData;

const emptyData: AdminGatewayData = {
  payments: [],
  payouts: [],
  disputes: [],
  supportTickets: [],
  adminUsers: [],
  categories: [],
  services: [],
  providerListings: [],
  bookingsSummary: null,
  usersSummary: null,
  operationsAlerts: null,
};

export function useAdminGatewayData() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<AdminGatewayData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endpointErrors, setEndpointErrors] = useState<Partial<Record<LoadKey, string>>>({});
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loaders = {
        categories: listCatalogCategories(),
        services: listCatalogServices(),
        providerListings: listProviderListings(),
        payments: accessToken ? listAdminPayments(accessToken) : Promise.resolve([]),
        payouts: accessToken ? listAdminPayouts(accessToken) : Promise.resolve([]),
        disputes: accessToken ? listAdminDisputes(accessToken) : Promise.resolve([]),
        supportTickets: accessToken
          ? listAdminSupportTickets(accessToken)
          : Promise.resolve([]),
        adminUsers: accessToken ? listAdminUsers(accessToken) : Promise.resolve([]),
        bookingsSummary: accessToken
          ? getAdminBookingsSummary(accessToken)
          : Promise.resolve(null),
        usersSummary: accessToken
          ? getAdminUsersSummary(accessToken)
          : Promise.resolve(null),
        operationsAlerts: accessToken
          ? getAdminOperationsAlerts(accessToken)
          : Promise.resolve(null),
      } satisfies Record<LoadKey, Promise<AdminGatewayData[LoadKey]>>;

      const nextData: AdminGatewayData = { ...emptyData };
      const nextErrors: Partial<Record<LoadKey, string>> = {};

      await Promise.all(
        Object.entries(loaders).map(async ([key, promise]) => {
          const loadKey = key as LoadKey;
          try {
            nextData[loadKey] = (await promise) as never;
          } catch (loadError) {
            nextErrors[loadKey] =
              loadError instanceof Error ? loadError.message : "Endpoint failed.";
          }
        }),
      );

      setData(nextData);
      setEndpointErrors(nextErrors);
      setLastLoadedAt(new Date().toISOString());

      if (Object.keys(nextErrors).length > 0) {
        setError(
          Object.entries(nextErrors)
            .map(([key, message]) => `${key}: ${message}`)
            .join(" | "),
        );
        return;
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load admin gateway data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => {
    const paidPayments = data.payments.filter((payment) => payment.status === "paid");
    const exceptionPayments = data.payments.filter(
      (payment) => payment.status === "cancelled" || payment.status === "refunded",
    );
    const openTickets = data.supportTickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_progress",
    );
    const approvedProviderListings = data.providerListings.filter(
      (provider) => provider.verificationStatus === "approved",
    );

    return {
      paymentCount: data.payments.length,
      totalPaymentAmount: data.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      ),
      paidPaymentAmount: paidPayments.reduce((sum, payment) => sum + payment.amount, 0),
      platformFees: data.payments.reduce(
        (sum, payment) => sum + payment.platformFee,
        0,
      ),
      exceptionPaymentCount: exceptionPayments.length,
      supportTicketCount: data.supportTickets.length,
      openSupportTicketCount: openTickets.length,
      disputeCount: data.disputes.length,
      openDisputeCount: data.disputes.filter((dispute) => dispute.status === "open")
        .length,
      categoryCount: data.categories.length,
      serviceCount: data.services.length,
      providerListingCount: data.providerListings.length,
      approvedProviderListingCount: approvedProviderListings.length,
      totalBookings: data.bookingsSummary?.totalCount ?? 0,
      bookingsByStatus: data.bookingsSummary?.byStatus ?? null,
      bookingsRevenue: data.bookingsSummary?.totalRevenue ?? 0,
      recentBookings: data.bookingsSummary?.recentCount ?? 0,
      totalUsers: data.usersSummary?.totalCount ?? 0,
      usersByRole: data.usersSummary?.byRole ?? null,
      usersByStatus: data.usersSummary?.byStatus ?? null,
      newUsersThisMonth: data.usersSummary?.newThisMonth ?? 0,
      operationsAlerts: data.operationsAlerts,
    };
  }, [data]);

  return {
    ...data,
    summary,
    isLoading,
    error,
    endpointErrors,
    lastLoadedAt,
    refresh,
  };
}
