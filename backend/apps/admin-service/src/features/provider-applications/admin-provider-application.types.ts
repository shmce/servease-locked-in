export type ProviderApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface AdminProviderApplicationDocumentSummary {
  id: string;
  applicationId: string;
  userId: string;
  documentType: string;
  fileUrl: string | null;
  storagePath: string | null;
  status: ProviderApplicationStatus;
  createdAt: string | null;
  previewUrl: string | null;
  downloadUrl: string | null;
}

export interface ProviderApplicationChecklistItem {
  id: string;
  label: string;
  subtitle?: string | null;
  checked: boolean;
}

export interface ProviderApplicationVerificationRecord {
  id: string;
  label: string;
  status: 'pending' | 'verified' | 'failed' | 'not_applicable';
  reference: string | null;
  checkedAt: string | null;
  details: string | null;
}

export interface ProviderApplicationReviewNote {
  id: string;
  adminUserId: string;
  adminName?: string | null;
  note: string;
  createdAt: string | null;
}

export interface ProviderApplicationReviewOcrData {
  governmentIdType?: string | null;
  governmentIdNumber?: string | null;
  tinNumber?: string | null;
  nbiNumber?: string | null;
  prcNumber?: string | null;
}

export interface AdminProviderApplicationReview {
  applicationId: string;
  kycChecklist: ProviderApplicationChecklistItem[];
  businessChecklist: ProviderApplicationChecklistItem[];
  verificationRecords: ProviderApplicationVerificationRecord[];
  ocrData: ProviderApplicationReviewOcrData;
  notes: ProviderApplicationReviewNote[];
  isComplete: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface UpdateProviderApplicationReviewInput {
  applicationId: string;
  adminUserId: string;
  kycChecklist: ProviderApplicationChecklistItem[];
  businessChecklist: ProviderApplicationChecklistItem[];
  verificationRecords: ProviderApplicationVerificationRecord[];
  ocrData: ProviderApplicationReviewOcrData;
}

export interface AdminProviderApplicationSummary {
  id: string;
  applicationReference: string;
  userId: string;
  businessName: string | null;
  serviceArea: string | null;
  serviceDescription: string | null;
  yearsExperience: number | null;
  verificationStatus: ProviderApplicationStatus;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  serviceCount: number;
  documentCount: number;
  pendingDocumentCount: number;
  approvedDocumentCount: number;
  rejectedDocumentCount: number;
  latestDecisionReason: string | null;
  latestDecisionAt: string | null;
  latestDecidedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  documents: AdminProviderApplicationDocumentSummary[];
}

export interface ListProviderApplicationsFilter {
  status?: ProviderApplicationStatus | null;
  query?: string | null;
  limit?: number | null;
}
