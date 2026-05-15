import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  ServiceCategory,
  ServiceProvider,
  Customer,
  Booking,
  Transaction,
  PayoutRequest,
  Dispute,
  Refund,
  AdminUser,
  AuditLog,
  DashboardStats,
  ProviderEarning,
} from "../types";
import * as dataStore from "../services/dataStore";

interface DataContextType {
  // Data
  serviceCategories: ServiceCategory[];
  serviceProviders: ServiceProvider[];
  customers: Customer[];
  bookings: Booking[];
  transactions: Transaction[];
  payoutRequests: PayoutRequest[];
  disputes: Dispute[];
  refunds: Refund[];
  adminUsers: AdminUser[];
  auditLogs: AuditLog[];

  // Computed Data
  dashboardStats: DashboardStats;

  // Helper Functions
  getCustomerById: (id: string) => Customer | undefined;
  getProviderById: (id: string) => ServiceProvider | undefined;
  getCategoryById: (id: string) => ServiceCategory | undefined;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByCustomer: (customerId: string) => Booking[];
  getBookingsByProvider: (providerId: string) => Booking[];
  getTransactionsByProvider: (providerId: string) => Transaction[];
  calculateProviderEarnings: (providerId: string) => ProviderEarning;

  // Actions
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  approveRefund: (refundId: string) => void;
  rejectRefund: (refundId: string, reason: string) => void;
  updateProviderStatus: (providerId: string, status: ServiceProvider["status"]) => void;
  approvePayoutRequest: (payoutId: string) => void;
  updateCommissionRate: (categoryId: string, newRate: number) => void;
  addAuditLog: (action: string, userId: string, details: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    dataStore.serviceCategories
  );
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>(
    dataStore.serviceProviders
  );
  const [customers] = useState<Customer[]>(dataStore.customers);
  const [bookings, setBookings] = useState<Booking[]>(dataStore.bookings);
  const [transactions, setTransactions] = useState<Transaction[]>(dataStore.transactions);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(
    dataStore.payoutRequests
  );
  const [disputes] = useState<Dispute[]>(dataStore.disputes);
  const [refunds, setRefunds] = useState<Refund[]>(dataStore.refunds);
  const [adminUsers] = useState<AdminUser[]>(dataStore.adminUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(dataStore.auditLogs);

  // Calculate Dashboard Stats
  const dashboardStats: DashboardStats = {
    totalRevenue: dataStore.calculateTotalRevenue(),
    totalBookings: bookings.length,
    activeProviders: serviceProviders.filter((p) => p.status === "Active").length,
    activeCustomers: customers.filter((c) => c.status === "Active").length,
    completionRate: dataStore.calculateCompletionRate(),
    avgBookingValue:
      bookings.length > 0
        ? bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length
        : 0,
  };

  // Update Booking Status
  const updateBookingStatus = useCallback(
    (bookingId: string, status: Booking["status"]) => {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status,
                completedDate: status === "Completed" ? new Date().toISOString() : booking.completedDate,
              }
            : booking
        )
      );

      // Update related transactions if completed
      if (status === "Completed") {
        const booking = bookings.find((b) => b.id === bookingId);
        if (booking) {
          setTransactions((prev) => [
            ...prev,
            {
              id: `TXN-${Date.now()}`,
              bookingId: booking.id,
              customerId: booking.customerId,
              providerId: booking.providerId,
              amount: booking.amount,
              commissionAmount: booking.commissionAmount,
              providerEarnings: booking.providerEarnings,
              paymentMethod: booking.paymentMethod,
              paymentStatus: booking.paymentStatus,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    },
    [bookings]
  );

  // Approve Refund
  const approveRefund = useCallback((refundId: string) => {
    setRefunds((prev) =>
      prev.map((refund) =>
        refund.id === refundId
          ? {
              ...refund,
              status: "Approved",
              processedDate: new Date().toISOString(),
            }
          : refund
      )
    );

    // Update booking payment status
    const refund = refunds.find((r) => r.id === refundId);
    if (refund) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === refund.bookingId
            ? { ...booking, paymentStatus: "Refunded" }
            : booking
        )
      );
    }
  }, [refunds]);

  // Reject Refund
  const rejectRefund = useCallback((refundId: string, reason: string) => {
    setRefunds((prev) =>
      prev.map((refund) =>
        refund.id === refundId
          ? {
              ...refund,
              status: "Rejected",
              processedDate: new Date().toISOString(),
            }
          : refund
      )
    );
  }, []);

  // Update Provider Status
  const updateProviderStatus = useCallback((providerId: string, status: ServiceProvider["status"]) => {
    setServiceProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId ? { ...provider, status } : provider
      )
    );
  }, []);

  // Approve Payout Request
  const approvePayoutRequest = useCallback((payoutId: string) => {
    setPayoutRequests((prev) =>
      prev.map((payout) =>
        payout.id === payoutId
          ? {
              ...payout,
              status: "Approved",
              processedDate: new Date().toISOString(),
            }
          : payout
      )
    );
  }, []);

  // Update Commission Rate
  const updateCommissionRate = useCallback((categoryId: string, newRate: number) => {
    setServiceCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, commissionRate: newRate } : category
      )
    );
  }, []);

  // Add Audit Log
  const addAuditLog = useCallback((action: string, userId: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      action,
      userId,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: "192.168.1.1", // In production, get from request
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  const value: DataContextType = {
    serviceCategories,
    serviceProviders,
    customers,
    bookings,
    transactions,
    payoutRequests,
    disputes,
    refunds,
    adminUsers,
    auditLogs,
    dashboardStats,
    getCustomerById: dataStore.getCustomerById,
    getProviderById: dataStore.getProviderById,
    getCategoryById: dataStore.getCategoryById,
    getBookingById: dataStore.getBookingById,
    getBookingsByCustomer: dataStore.getBookingsByCustomer,
    getBookingsByProvider: dataStore.getBookingsByProvider,
    getTransactionsByProvider: dataStore.getTransactionsByProvider,
    calculateProviderEarnings: dataStore.calculateProviderEarnings,
    updateBookingStatus,
    approveRefund,
    rejectRefund,
    updateProviderStatus,
    approvePayoutRequest,
    updateCommissionRate,
    addAuditLog,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
