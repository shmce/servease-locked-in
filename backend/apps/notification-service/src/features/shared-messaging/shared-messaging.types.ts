export interface SharedEmailRecipient {
  email: string;
  name?: string;
}

export interface SharedEmailSendRequest {
  to: SharedEmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface SharedMessageResponse {
  messageId: string;
  provider: string;
  status: 'queued' | 'sent' | 'failed';
}

export interface SharedMessageStatus {
  messageId: string;
  provider: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  deliveredAt?: string;
  failureReason?: string;
}

export interface SharedSmsSendRequest {
  to: string;
  message: string;
  senderId?: string;
  metadata?: Record<string, string>;
}

