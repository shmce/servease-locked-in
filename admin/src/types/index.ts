// Core Entity Types - Single Source of Truth

export type BookingStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Refunded" | "Failed";
export type PaymentMethod = "Credit Card" | "Debit Card";
export type ProviderStatus = "Active" | "Inactive" | "Suspended";
export type DisputeStatus = "Open" | "Under Review" | "Resolved" | "Escalated";
export type PayoutStatus = "Pending" | "Approved" | "Released" | "Rejected";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  totalBookings: number;
  totalSpent: number;
  status: "Active" | "Inactive";
}

export interface ServiceCategory {
  id: string;
  name: string;
  commissionRate: number;
}

export interface ServiceProvider {
  id: string;
  businessName: string;
  categoryId: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: ProviderStatus;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  joinedDate: string;
  location: string;
  totalRevenue: number;
  totalEarnings: number;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  categoryId: string;
  serviceDescription: string;
  scheduledDate: string;
  completedDate?: string;
  amount: number;
  commissionAmount: number;
  providerEarnings: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  location: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  commissionAmount: number;
  providerEarnings: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  timestamp: string;
}

export interface ProviderEarning {
  providerId: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalBookings: number;
  completedBookings: number;
  lastPayoutDate?: string;
}

export interface PayoutRequest {
  id: string;
  providerId: string;
  amount: number;
  status: PayoutStatus;
  requestedDate: string;
  processedDate?: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface Dispute {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  reason: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  refundAmount?: number;
}

export interface Refund {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Processed";
  requestedDate: string;
  processedDate?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Finance Manager" | "Support Manager";
  permissions: string[];
  lastLogin: string;
  status: "Active" | "Inactive";
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

// Computed/Derived Types
export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeProviders: number;
  activeCustomers: number;
  completionRate: number;
  avgBookingValue: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  commissionEarned: number;
  netProviderEarnings: number;
  refundRate: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    commission: number;
    netProviderEarnings: number;
  }>;
}

export interface BookingMetrics {
  totalBookings: number;
  completionRate: number;
  cancellationRate: number;
  peakBookingHour: string;
  bookingsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    bookings: number;
    percentage: number;
  }>;
}

export interface ProviderMetrics {
  totalProviders: number;
  averageRating: number;
  avgCompletionRate: number;
  avgDisputeRate: number;
  topProviders: Array<{
    providerId: string;
    businessName: string;
    rating: number;
    completionRate: number;
    revenue: number;
    disputes: number;
  }>;
}

export interface CustomerMetrics {
  newUsers: number;
  activeUsers: number;
  repeatBookingRate: number;
  churnRate: number;
  monthlyGrowth: Array<{
    month: string;
    newUsers: number;
    activeUsers: number;
    repeatRate: number;
    churnRate: number;
  }>;
}
