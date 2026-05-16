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

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AvailabilityWindow {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProviderDayOff {
  id: string;
  offDate: string;
  reason: string | null;
}

export interface ProviderAvailabilitySchedule {
  providerId: string;
  windows: AvailabilityWindow[];
  daysOff: ProviderDayOff[];
}

export interface LandingCatalogData {
  categories: CatalogCategory[];
  services: CatalogServiceItem[];
  providers: ProviderServiceListing[];
  unavailable: boolean;
}

const DEFAULT_GATEWAY_BASE_URL = 'http://localhost:5001';

export async function fetchLandingCatalog(): Promise<LandingCatalogData> {
  try {
    const [categories, services, providers] = await Promise.all([
      fetchGatewayData<CatalogCategory[]>('/v1/catalog/categories'),
      fetchGatewayData<CatalogServiceItem[]>('/v1/catalog/services'),
      fetchGatewayData<ProviderServiceListing[]>('/v1/catalog/providers'),
    ]);

    return {
      categories,
      services,
      providers,
      unavailable: false,
    };
  } catch {
    return {
      categories: [],
      services: [],
      providers: [],
      unavailable: true,
    };
  }
}

export async function fetchCatalogServices(): Promise<CatalogServiceItem[]> {
  return fetchGatewayData<CatalogServiceItem[]>('/v1/catalog/services');
}

export async function fetchProviderListings(): Promise<ProviderServiceListing[]> {
  return fetchGatewayData<ProviderServiceListing[]>('/v1/catalog/providers');
}

export async function fetchProviderPortfolio(
  providerId: string,
): Promise<ProviderPortfolioMediaSummary[]> {
  return fetchGatewayData<ProviderPortfolioMediaSummary[]>(
    `/v1/catalog/providers/${encodeURIComponent(providerId)}/portfolio`,
  );
}

export async function fetchProviderAvailability(
  providerId: string,
): Promise<ProviderAvailabilitySchedule> {
  return fetchGatewayData<ProviderAvailabilitySchedule>(
    `/v1/provider/availability/${encodeURIComponent(providerId)}`,
  );
}

export async function fetchGatewayData<T>(path: string): Promise<T> {
  const baseUrl = process.env.SERVEASE_API_BASE_URL ?? DEFAULT_GATEWAY_BASE_URL;
  const response = await fetch(`${baseUrl}${path}`, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gateway request failed: ${path}`);
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
}
