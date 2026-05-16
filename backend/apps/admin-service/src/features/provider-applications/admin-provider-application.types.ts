export type ProviderApplicationStatus = 'pending' | 'approved' | 'rejected';

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
}

export interface ListProviderApplicationsFilter {
  status?: ProviderApplicationStatus | null;
  query?: string | null;
  limit?: number | null;
}
