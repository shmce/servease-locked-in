export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: string;
  userId: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  createdAt: string | null;
}
