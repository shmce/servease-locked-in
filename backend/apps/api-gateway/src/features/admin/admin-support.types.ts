export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: string;
  userId: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  assigneeId?: string | null;
  createdAt: string | null;
  attachments?: unknown[];
}

export interface SupportTicketReplySummary {
  id: string;
  ticketId: string;
  repliedBy: string;
  message: string;
  createdAt: string | null;
}
