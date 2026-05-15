export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface PaymentSummary {
  id: string;
  bookingId: string;
  customerId: string | null;
  providerId: string | null;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string | null;
}
