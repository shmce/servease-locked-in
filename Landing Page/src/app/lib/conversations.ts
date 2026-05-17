export type MessageSenderRole = 'customer' | 'provider';

export interface ConversationSummary {
  id: string;
  bookingId: string | null;
  customerId: string | null;
  providerId: string | null;
  lastMessageAt: string | null;
  createdAt: string | null;
}

export interface ConversationMessageAttachment {
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  deliveryStatus: string | null;
  createdAt: string | null;
  attachment: ConversationMessageAttachment | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function openBookingConversation(
  accessToken: string,
  bookingId: string,
): Promise<ConversationSummary> {
  return fetchConversationApi<ConversationSummary>('/api/conversations', {
    accessToken,
    method: 'POST',
    body: { bookingId },
  });
}

export function listConversationMessages(
  accessToken: string,
  conversationId: string,
): Promise<ConversationMessage[]> {
  return fetchConversationApi<ConversationMessage[]>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      accessToken,
    },
  );
}

export function sendConversationMessage(
  accessToken: string,
  conversationId: string,
  content: string,
): Promise<ConversationMessage> {
  return fetchConversationApi<ConversationMessage>(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      accessToken,
      method: 'POST',
      body: { content },
    },
  );
}

async function fetchConversationApi<T>(
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
    throw new Error('Could not reach messages. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Messaging request failed.');
  }

  return payload.data;
}
