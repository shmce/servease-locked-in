export interface ProviderProfileSummary {
  id: string;
  businessName: string | null;
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
