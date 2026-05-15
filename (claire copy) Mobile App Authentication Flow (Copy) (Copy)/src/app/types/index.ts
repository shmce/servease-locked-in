// ═══════════════════════════════════════════════════════════════
// ServEase – Shared TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════

/** Service Provider profile */
export interface Provider {
  id: string;
  name: string;
  businessName?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  description: string;
  priceRange?: { min: number; max: number };
  flatRate?: number;
  hourlyRate?: number;
  completedJobs: number;
  responseTime: string;
  isVerified: boolean;
  isAvailable: boolean;
  location: string;
  categories?: string[];
  languages?: string[];
  yearsOfExperience?: number;
}

/** A single service offered within a category */
export interface Service {
  id: number;
  title: string;
  description: string;
  /** Starting price in Philippine Peso */
  price: number;
  image: string;
  categorySlug?: string;
}

/** Service category grouping */
export interface ServiceCategory {
  id: string;
  label: string;
  subs: string;
  icon: string;
  color: string;
}

/** Customer booking */
export interface Booking {
  id: string;
  serviceType: string;
  providerName: string;
  providerId: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  amountPaid: number;
  address?: string;
  notes?: string;
}

/** Review left by a customer */
export interface Review {
  id: number;
  customerName: string;
  rating: number;
  date: string;
  text: string;
  serviceType: string;
  photos: string[];
  providerResponse?: string;
  helpfulCount: number;
}

/** Address saved by a customer */
export interface Address {
  id: string;
  label: string;
  address: string;
  isDefault?: boolean;
}

/** Payment method saved by a user */
export interface PaymentMethod {
  id: string;
  type: "gcash" | "maya" | "card" | "bank" | "cod";
  label: string;
  last4?: string;
  isDefault?: boolean;
}

/** Notification item */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
}

/** Conversation thread */
export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
