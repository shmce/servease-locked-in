export interface ProviderProfileSummary {
  id: string;
  businessName: string | null;
  bio?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
  yearsExperience?: number | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  averageRating: number;
  reviewCount: number;
}

export interface CreateProviderProfileInput {
  userId: string;
  businessName: string;
  serviceDescription?: string | null;
  serviceArea?: string | null;
}

export interface UpdateProviderProfileInput {
  userId: string;
  businessName: string;
  bio?: string | null;
  serviceDescription?: string | null;
  serviceArea?: string | null;
  yearsExperience?: number | null;
}

export interface ProviderPortfolioMediaInput {
  userId: string;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
  caption?: string | null;
}

export interface ProviderPortfolioMediaSummary {
  id: string;
  providerId: string;
  uploadedBy: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  storagePath: string | null;
  fileSize: number | null;
  caption: string | null;
  sortOrder: number;
  createdAt: string | null;
}

export interface ProviderOwnedServiceInput {
  id?: string | null;
  serviceId?: string | null;
  title: string;
  description?: string | null;
  price?: number | null;
  pricingMode?: 'flat' | 'hourly' | null;
  isActive?: boolean | null;
}

export interface ProviderOwnedServiceSummary {
  id: string;
  providerId: string;
  providerBusinessName: string | null;
  serviceId: string | null;
  title: string;
  description: string | null;
  price: number | null;
  pricingMode: 'flat' | 'hourly';
  averageRating: number;
  reviewCount: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
}

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
