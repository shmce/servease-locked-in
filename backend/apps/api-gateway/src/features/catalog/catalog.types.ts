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
