export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface BookingServiceAddress {
  line1: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateBookingInput {
  serviceId: string;
  providerId: string;
  scheduledAt: string;
  serviceAddress: BookingServiceAddress;
  hoursRequired?: number;
  customerNotes?: string;
  acceptedQuoteId?: string;
}

export interface CreateBookingResult {
  bookingId: string;
  status: BookingStatus;
  serviceId: string;
  providerId: string;
  scheduledAt: string;
}

export interface BookingSummary {
  id: string;
  status: BookingStatus;
  serviceId: string;
  providerId: string;
  customerId?: string;
  scheduledAt: string;
  serviceName?: string | null;
  providerName?: string | null;
  customerName?: string | null;
  totalAmount?: number | null;
}

export interface ListBookingsParams {
  status?: BookingStatus;
  role?: 'customer' | 'provider';
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
  reason?: string;
}
