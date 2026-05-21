export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: string;
  userId: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  createdAt: string | null;
  attachments: SupportTicketAttachmentSummary[];
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

export interface SupportTicketReplySummary {
  id: string;
  ticketId: string;
  repliedBy: string;
  message: string;
  createdAt: string | null;
}

export interface CreateSupportTicketInput {
  subject: string;
  message: string;
  category?: string | null;
}

export interface CreateBookingIssueSupportTicketInput {
  bookingId: string;
  bookingReference: string;
  message: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function listSupportTickets(
  accessToken: string,
): Promise<SupportTicketSummary[]> {
  return fetchSupportTicketApi<SupportTicketSummary[]>('/api/support-tickets', {
    accessToken,
  });
}

export function createSupportTicket(
  accessToken: string,
  input: CreateSupportTicketInput,
): Promise<SupportTicketSummary> {
  return fetchSupportTicketApi<SupportTicketSummary>('/api/support-tickets', {
    accessToken,
    method: 'POST',
    body: input,
  });
}

export function createBookingIssueSupportTicket(
  accessToken: string,
  input: CreateBookingIssueSupportTicketInput,
): Promise<SupportTicketSummary> {
  return createSupportTicket(accessToken, {
    subject: `Booking issue: ${input.bookingReference}`,
    message: `Booking: ${input.bookingId}\nReference: ${input.bookingReference}\n\n${input.message}`,
    category: 'booking_issue',
  });
}

export function listSupportTicketReplies(
  accessToken: string,
  ticketId: string,
): Promise<SupportTicketReplySummary[]> {
  return fetchSupportTicketApi<SupportTicketReplySummary[]>(
    `/api/support-tickets/${encodeURIComponent(ticketId)}/replies`,
    {
      accessToken,
    },
  );
}

export function createSupportTicketReply(
  accessToken: string,
  ticketId: string,
  message: string,
): Promise<SupportTicketReplySummary> {
  return fetchSupportTicketApi<SupportTicketReplySummary>(
    `/api/support-tickets/${encodeURIComponent(ticketId)}/replies`,
    {
      accessToken,
      method: 'POST',
      body: { message },
    },
  );
}

async function fetchSupportTicketApi<T>(
  path: string,
  options: {
    accessToken: string;
    method?: 'GET' | 'POST';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach support. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Support request failed.');
  }

  return payload.data;
}
