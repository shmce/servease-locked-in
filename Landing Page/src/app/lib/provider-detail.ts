import {
  fetchCatalogServices,
  fetchGatewayData,
  fetchProviderListings,
  fetchProviderPortfolio,
  type CatalogServiceItem,
  type ProviderPortfolioMediaSummary,
  type ProviderServiceListing,
} from './catalog';
import type { ReviewSummary } from './reviews';

export interface ProviderDetailData {
  listing: ProviderServiceListing;
  service: CatalogServiceItem | null;
  relatedListings: ProviderServiceListing[];
  portfolio: ProviderPortfolioMediaSummary[];
  reviews: ReviewSummary[];
}

export async function fetchProviderDetail(
  listingId: string,
): Promise<ProviderDetailData | null> {
  const [services, listings] = await Promise.all([
    fetchCatalogServices(),
    fetchProviderListings(),
  ]);
  const listing = listings.find((item) => item.id === listingId);

  if (!listing) {
    return null;
  }

  const service = listing.serviceId
    ? services.find((item) => item.id === listing.serviceId) ?? null
    : null;
  const relatedListings = listings.filter(
    (item) => item.providerId === listing.providerId && item.id !== listing.id,
  );
  const [portfolio, reviews] = await Promise.all([
    fetchProviderPortfolio(listing.providerId).catch(() => []),
    fetchGatewayData<ReviewSummary[]>(
      `/v1/reviews?providerId=${encodeURIComponent(listing.providerId)}`,
    ).catch(() => []),
  ]);

  return {
    listing,
    service,
    relatedListings,
    portfolio,
    reviews,
  };
}
