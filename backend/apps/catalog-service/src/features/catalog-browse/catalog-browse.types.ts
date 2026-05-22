export type PricingMode = 'flat' | 'hourly';

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
  pricingMode: PricingMode;
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
  pricingMode: PricingMode;
  averageRating: number;
  reviewCount: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}
