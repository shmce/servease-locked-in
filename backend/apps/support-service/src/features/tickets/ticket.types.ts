export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: string;
  userId: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  assigneeId: string | null;
  createdAt: string | null;
  attachments: SupportTicketAttachmentSummary[];
}

export interface SupportTicketReplySummary {
  id: string;
  ticketId: string;
  repliedBy: string;
  message: string;
  createdAt: string | null;
}

export interface CreateSupportTicketInput {
  userId: string;
  subject: string;
  message?: string | null;
  category?: string | null;
  attachments?: SupportTicketAttachmentInput[];
}

export interface SupportTicketAttachmentInput {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
}

export interface SupportTicketAttachmentSummary {
  id: string;
  ticketId: string;
  uploadedBy: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  createdAt: string | null;
}
