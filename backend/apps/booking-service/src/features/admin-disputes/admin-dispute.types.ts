export type AdminDisputeStatus = 'open' | 'resolved' | 'closed';

export interface AdminDisputeSummary {
  id: string;
  bookingId: string | null;
  bookingReference: string | null;
  customerId: string | null;
  providerId: string | null;
  raisedBy: string;
  reason: string | null;
  status: AdminDisputeStatus;
  amount: number;
  createdAt: string | null;
}
