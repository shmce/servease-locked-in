export type MessageSenderRole = 'customer' | 'provider';

export interface ConversationSummary {
  id: string;
  bookingId: string | null;
  customerId: string | null;
  providerId: string | null;
  lastMessageAt: string | null;
  createdAt: string | null;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  deliveryStatus: string | null;
  createdAt: string | null;
}

export interface ConversationVisibility {
  customerId: string | null;
  providerId: string | null;
}

export interface GetOrCreateConversationRequest {
  bookingId: string;
  customerId: string;
  providerId: string;
}

export interface CreateConversationMessageRequest extends ConversationVisibility {
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
}
