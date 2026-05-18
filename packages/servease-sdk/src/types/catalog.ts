export interface CatalogCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  iconUrl?: string | null;
}

export interface CatalogService {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  pricingMode?: 'flat' | 'hourly';
  basePrice?: number | null;
}

export interface CatalogProvider {
  id: string;
  businessName: string;
  displayName?: string | null;
  serviceIds?: string[];
  city?: string | null;
  rating?: number | null;
  reviewCount?: number;
}

export interface ListCatalogServicesParams {
  categoryId?: string;
  q?: string;
}

export interface ListCatalogProvidersParams {
  serviceId?: string;
  city?: string;
  q?: string;
}
