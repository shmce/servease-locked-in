import {
  ServiceCategory,
  ServiceProvider,
  Customer,
  Booking,
  Transaction,
  ProviderEarning,
  PayoutRequest,
  Dispute,
  Refund,
  AdminUser,
  AuditLog,
} from "../types";

// Service Categories - Single Source of Truth
export const serviceCategories: ServiceCategory[] = [
  { id: "CAT-001", name: "Home Maintenance & Repair", commissionRate: 18 },
  { id: "CAT-002", name: "Beauty, Wellness & Personal Care", commissionRate: 20 },
  { id: "CAT-003", name: "Domestic & Cleaning Services", commissionRate: 15 },
  { id: "CAT-004", name: "Pet Services", commissionRate: 17 },
  { id: "CAT-005", name: "Events & Entertainment", commissionRate: 16 },
  { id: "CAT-006", name: "Automotive & Tech Support", commissionRate: 22 },
  { id: "CAT-007", name: "Education & Professional Services", commissionRate: 19 },
];

// Customers
export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "Maria Santos",
    email: "maria.santos@gmail.com",
    phone: "+63 917 123 4567",
    location: "Makati City, Metro Manila",
    memberSince: "2025-06-15",
    totalBookings: 45,
    totalSpent: 125000,
    status: "Active",
  },
  {
    id: "CUST-002",
    name: "Jose Reyes",
    email: "jose.reyes@gmail.com",
    phone: "+63 917 234 5678",
    location: "Quezon City, Metro Manila",
    memberSince: "2025-07-22",
    totalBookings: 38,
    totalSpent: 98000,
    status: "Active",
  },
  {
    id: "CUST-003",
    name: "Ana Cruz",
    email: "ana.cruz@gmail.com",
    phone: "+63 917 345 6789",
    location: "Taguig City, Metro Manila",
    memberSince: "2025-05-10",
    totalBookings: 42,
    totalSpent: 112000,
    status: "Active",
  },
];

// Service Providers
export const serviceProviders: ServiceProvider[] = [
  {
    id: "PRV-001",
    businessName: "HomeFixPro Manila",
    categoryId: "CAT-001",
    contactPerson: "Juan Dela Cruz",
    email: "contact@homefixpro.ph",
    phone: "+63 917 123 4567",
    status: "Active",
    rating: 4.8,
    totalBookings: 234,
    completedBookings: 228,
    cancelledBookings: 6,
    completionRate: 97.4,
    joinedDate: "2025-06-15",
    location: "Makati City, Metro Manila",
    totalRevenue: 587000,
    totalEarnings: 481340, // Auto-calculated
  },
  {
    id: "PRV-002",
    businessName: "Sparkle Clean Services",
    categoryId: "CAT-003",
    contactPerson: "Maria Santos",
    email: "info@sparkleclean.ph",
    phone: "+63 917 234 5678",
    status: "Active",
    rating: 4.9,
    totalBookings: 198,
    completedBookings: 192,
    cancelledBookings: 6,
    completionRate: 97.0,
    joinedDate: "2025-07-20",
    location: "Quezon City, Metro Manila",
    totalRevenue: 510000,
    totalEarnings: 433500,
  },
  {
    id: "PRV-003",
    businessName: "Glow Beauty Spa",
    categoryId: "CAT-002",
    contactPerson: "Ana Reyes",
    email: "hello@glowbeauty.ph",
    phone: "+63 917 345 6789",
    status: "Active",
    rating: 4.7,
    totalBookings: 167,
    completedBookings: 158,
    cancelledBookings: 9,
    completionRate: 94.6,
    joinedDate: "2025-08-10",
    location: "Taguig City, Metro Manila",
    totalRevenue: 445000,
    totalEarnings: 356000,
  },
  {
    id: "PRV-004",
    businessName: "TechFix Auto Solutions",
    categoryId: "CAT-006",
    contactPerson: "Roberto Garcia",
    email: "support@techfix.ph",
    phone: "+63 917 456 7890",
    status: "Active",
    rating: 4.6,
    totalBookings: 156,
    completedBookings: 149,
    cancelledBookings: 7,
    completionRate: 95.5,
    joinedDate: "2025-09-01",
    location: "Pasig City, Metro Manila",
    totalRevenue: 398000,
    totalEarnings: 310440,
  },
  {
    id: "PRV-005",
    businessName: "QuickFix Plumbing",
    categoryId: "CAT-001",
    contactPerson: "Carlos Aquino",
    email: "carlos@quickfix.ph",
    phone: "+63 917 567 8901",
    status: "Suspended",
    rating: 3.8,
    totalBookings: 89,
    completedBookings: 73,
    cancelledBookings: 16,
    completionRate: 82.0,
    joinedDate: "2025-10-15",
    location: "Manila City, Metro Manila",
    totalRevenue: 156000,
    totalEarnings: 127920,
  },
];

// Bookings - Source of Truth for all financial calculations
export const bookings: Booking[] = [
  {
    id: "BK-2026-001",
    customerId: "CUST-001",
    providerId: "PRV-001",
    categoryId: "CAT-001",
    serviceDescription: "Aircon repair and cleaning",
    scheduledDate: "2026-03-05T10:00:00",
    completedDate: "2026-03-05T12:30:00",
    amount: 3500,
    commissionAmount: 630, // 18% of 3500
    providerEarnings: 2870,
    status: "Completed",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    location: "Makati City, Metro Manila",
    createdAt: "2026-03-01T14:30:00",
  },
  {
    id: "BK-2026-002",
    customerId: "CUST-002",
    providerId: "PRV-002",
    categoryId: "CAT-003",
    serviceDescription: "Deep cleaning service",
    scheduledDate: "2026-03-06T09:00:00",
    amount: 2500,
    commissionAmount: 375, // 15% of 2500
    providerEarnings: 2125,
    status: "Confirmed",
    paymentStatus: "Paid",
    paymentMethod: "Debit Card",
    location: "Quezon City, Metro Manila",
    createdAt: "2026-03-02T10:15:00",
  },
  {
    id: "BK-2026-003",
    customerId: "CUST-003",
    providerId: "PRV-003",
    categoryId: "CAT-002",
    serviceDescription: "Hair treatment and spa",
    scheduledDate: "2026-03-07T14:00:00",
    completedDate: "2026-03-07T16:00:00",
    amount: 4800,
    commissionAmount: 960, // 20% of 4800
    providerEarnings: 3840,
    status: "Completed",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    location: "Taguig City, Metro Manila",
    createdAt: "2026-03-03T11:20:00",
  },
  {
    id: "BK-2026-004",
    customerId: "CUST-001",
    providerId: "PRV-004",
    categoryId: "CAT-006",
    serviceDescription: "Car diagnostic and repair",
    scheduledDate: "2026-03-08T15:00:00",
    amount: 5500,
    commissionAmount: 1210, // 22% of 5500
    providerEarnings: 4290,
    status: "In Progress",
    paymentStatus: "Paid",
    paymentMethod: "Debit Card",
    location: "Pasig City, Metro Manila",
    createdAt: "2026-03-04T09:00:00",
  },
  {
    id: "BK-2026-005",
    customerId: "CUST-002",
    providerId: "PRV-001",
    categoryId: "CAT-001",
    serviceDescription: "Electrical wiring repair",
    scheduledDate: "2026-03-10T10:00:00",
    amount: 3200,
    commissionAmount: 576, // 18% of 3200
    providerEarnings: 2624,
    status: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "Credit Card",
    location: "Makati City, Metro Manila",
    createdAt: "2026-03-04T15:45:00",
  },
];

// Transactions - Generated from completed bookings
export const transactions: Transaction[] = bookings
  .filter((b) => b.paymentStatus === "Paid")
  .map((booking) => ({
    id: `TXN-${booking.id.split("-")[2]}`,
    bookingId: booking.id,
    customerId: booking.customerId,
    providerId: booking.providerId,
    amount: booking.amount,
    commissionAmount: booking.commissionAmount,
    providerEarnings: booking.providerEarnings,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    timestamp: booking.completedDate || booking.createdAt,
  }));

// Payout Requests
export const payoutRequests: PayoutRequest[] = [
  {
    id: "PAY-2026-001",
    providerId: "PRV-001",
    amount: 45000,
    status: "Approved",
    requestedDate: "2026-03-01T10:00:00",
    processedDate: "2026-03-02T14:30:00",
    bankDetails: {
      accountName: "HomeFixPro Manila",
      accountNumber: "1234567890",
      bankName: "BPI",
    },
  },
  {
    id: "PAY-2026-002",
    providerId: "PRV-002",
    amount: 38000,
    status: "Pending",
    requestedDate: "2026-03-03T09:15:00",
    bankDetails: {
      accountName: "Sparkle Clean Services",
      accountNumber: "0987654321",
      bankName: "BDO",
    },
  },
];

// Disputes
export const disputes: Dispute[] = [
  {
    id: "DIS-2026-001",
    bookingId: "BK-2026-001",
    customerId: "CUST-001",
    providerId: "PRV-001",
    reason: "Service Quality Issue",
    description: "Aircon still not working properly after repair",
    amount: 3500,
    status: "Under Review",
    createdAt: "2026-03-05T15:00:00",
  },
];

// Refunds
export const refunds: Refund[] = [
  {
    id: "REF-2026-001",
    bookingId: "BK-2026-001",
    customerId: "CUST-001",
    amount: 3500,
    reason: "Service quality issue",
    status: "Pending",
    requestedDate: "2026-03-05T15:30:00",
  },
];

// Admin Users
export const adminUsers: AdminUser[] = [
  {
    id: "ADM-001",
    name: "Juan Dela Cruz",
    email: "juan@servease.ph",
    role: "Super Admin",
    permissions: ["full_access"],
    lastLogin: "2026-03-04T14:30:00",
    status: "Active",
  },
  {
    id: "ADM-002",
    name: "Maria Santos",
    email: "maria@servease.ph",
    role: "Finance Manager",
    permissions: ["finance_access"],
    lastLogin: "2026-03-04T10:15:00",
    status: "Active",
  },
];

// Audit Logs
export const auditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    action: "Commission Rate Updated",
    userId: "ADM-001",
    timestamp: "2026-03-04T14:30:00",
    details: "Changed Beauty & Wellness commission from 18% to 20%",
    ipAddress: "192.168.1.1",
  },
  {
    id: "LOG-002",
    action: "Dispute Resolved",
    userId: "ADM-002",
    timestamp: "2026-03-04T13:15:00",
    details: "Approved refund for BK-2026-001 (₱3,500)",
    ipAddress: "192.168.1.2",
  },
];

// Helper Functions for Relational Data

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getProviderById(id: string): ServiceProvider | undefined {
  return serviceProviders.find((p) => p.id === id);
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return serviceCategories.find((c) => c.id === id);
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function getBookingsByCustomer(customerId: string): Booking[] {
  return bookings.filter((b) => b.customerId === customerId);
}

export function getBookingsByProvider(providerId: string): Booking[] {
  return bookings.filter((b) => b.providerId === providerId);
}

export function getTransactionsByProvider(providerId: string): Transaction[] {
  return transactions.filter((t) => t.providerId === providerId);
}

export function calculateProviderEarnings(providerId: string): ProviderEarning {
  const providerBookings = getBookingsByProvider(providerId);
  const completedBookings = providerBookings.filter((b) => b.status === "Completed");
  const paidBookings = completedBookings.filter((b) => b.paymentStatus === "Paid");

  const totalEarnings = paidBookings.reduce((sum, b) => sum + b.providerEarnings, 0);
  const pendingEarnings = completedBookings
    .filter((b) => b.paymentStatus === "Pending")
    .reduce((sum, b) => sum + b.providerEarnings, 0);

  const payouts = payoutRequests.filter(
    (p) => p.providerId === providerId && p.status === "Released"
  );
  const lastPayout = payouts.length > 0 ? payouts[payouts.length - 1] : undefined;

  return {
    providerId,
    totalEarnings,
    pendingEarnings,
    paidEarnings: totalEarnings - pendingEarnings,
    totalBookings: providerBookings.length,
    completedBookings: completedBookings.length,
    lastPayoutDate: lastPayout?.processedDate,
  };
}

export function calculateTotalRevenue(): number {
  return bookings
    .filter((b) => b.status === "Completed" && b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.amount, 0);
}

export function calculateTotalCommission(): number {
  return bookings
    .filter((b) => b.status === "Completed" && b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.commissionAmount, 0);
}

export function calculateCompletionRate(): number {
  const completed = bookings.filter((b) => b.status === "Completed").length;
  return bookings.length > 0 ? (completed / bookings.length) * 100 : 0;
}

export function calculateCancellationRate(): number {
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
  return bookings.length > 0 ? (cancelled / bookings.length) * 100 : 0;
}
