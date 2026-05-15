export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PricingMode = 'flat' | 'hourly';

export interface CreateBookingInput {
  customerId: string;
  providerId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  serviceName?: string | null;
  serviceDescription?: string | null;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  serviceAmount?: number | null;
  pricingMode?: PricingMode | null;
  paymentMethod?: string | null;
  customerNotes?: string | null;
}

export interface BookingSummary {
  id: string;
  bookingReference: string;
  customerId: string;
  providerId: string;
  serviceId: string | null;
  serviceTitle: string | null;
  serviceAddress: string | null;
  scheduledAt: string;
  status: BookingStatus;
  totalAmount: number;
}
