import { Buffer } from 'node:buffer';

export type UploadKind =
  | 'booking_reference'
  | 'support_evidence'
  | 'message_attachment'
  | 'provider_portfolio'
  | 'provider_progress';

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
}
