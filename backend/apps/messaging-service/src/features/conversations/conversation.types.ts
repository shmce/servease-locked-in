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
  attachment: ConversationMessageAttachment | null;
}

export interface ConversationMessageAttachment {
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
}

export interface ConversationMessageAttachmentInput {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
}

export interface ConversationVisibility {
  customerId: string | null;
  providerId: string | null;
}

export interface GetOrCreateConversationInput {
  bookingId: string;
  customerId: string;
  providerId: string;
}

export interface CreateConversationMessageInput extends ConversationVisibility {
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  content: string;
  attachment?: ConversationMessageAttachmentInput | null;
}
