export interface CatalogCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface CatalogServiceItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number | null;
  pricingMode: 'flat' | 'hourly';
}

export type ServiceAreaStatus = 'active' | 'inactive';

export interface ServiceAreaSummary {
  id: string;
  name: string;
  city: string;
  region: string;
  status: ServiceAreaStatus;
  providerCount: number;
  latitude: number | null;
  longitude: number | null;
}

export interface ProviderServiceListing {
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

export interface ProviderOwnedServiceSummary extends ProviderServiceListing {
  isActive: boolean;
}

export interface ProviderPortfolioMediaInput {
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
  caption?: string | null;
}

export type ProviderPortfolioMediaReplacementInput = ProviderPortfolioMediaInput;

export interface ProviderPortfolioOrderItem {
  id: string;
  sortOrder: number;
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
