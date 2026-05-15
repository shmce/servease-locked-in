export interface ProviderProfileSummary {
  id: string;
  businessName: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  averageRating: number;
  reviewCount: number;
}
