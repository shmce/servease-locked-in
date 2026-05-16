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

export interface AdminProviderApplicationInfoRequestResult {
  applicationId: string;
  providerUserId: string;
  notificationId: string;
}

export interface ListProviderApplicationsFilter {
  status?: ProviderApplicationStatus | null;
  query?: string | null;
  limit?: number | null;
}
