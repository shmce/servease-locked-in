import { Buffer } from 'node:buffer';

export type UploadKind =
  | 'booking_reference'
  | 'support_evidence'
  | 'message_attachment'
  | 'provider_portfolio'
  | 'provider_progress'
  | 'provider_document';

export interface ProviderApplicationDocumentUploadSummary {
  id: string;
  applicationId: string;
  userId: string;
  documentType: string;
  fileUrl: string | null;
  storagePath: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string | null;
  previewUrl: string | null;
  downloadUrl: string | null;
}

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadSummary {
  bucket: string;
  path: string;
  publicUrl: string;
  kind: UploadKind;
  contentType: string;
  size: number;
  document?: ProviderApplicationDocumentUploadSummary;
}
