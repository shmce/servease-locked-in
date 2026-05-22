import {
  fetchCatalogServices,
  fetchGatewayData,
  fetchProviderAvailability,
  fetchProviderListings,
  fetchProviderPortfolio,
  type CatalogServiceItem,
  type ProviderAvailabilitySchedule,
  type ProviderPortfolioMediaSummary,
  type ProviderServiceListing,
} from './catalog';
import type { ReviewSummary } from './reviews';

export interface ProviderDetailData {
  listing: ProviderServiceListing;
  service: CatalogServiceItem | null;
  relatedListings: ProviderServiceListing[];
  portfolio: ProviderPortfolioMediaSummary[];
  availability: ProviderAvailabilitySchedule | null;
  reviews: ReviewSummary[];
  loadErrors: {
    portfolio: string | null;
    availability: string | null;
    reviews: string | null;
  };
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
  const [portfolio, availability, reviews] = await Promise.all([
    loadOptionalProviderDetailSection('portfolio', [], () =>
      fetchProviderPortfolio(listing.providerId),
    ),
    loadOptionalProviderDetailSection('availability', null, () =>
      fetchProviderAvailability(listing.providerId),
    ),
    loadOptionalProviderDetailSection('reviews', [], () =>
      fetchGatewayData<ReviewSummary[]>(
        `/v1/reviews?providerId=${encodeURIComponent(listing.providerId)}`,
      ),
    ),
  ]);

  return {
    listing,
    service,
    relatedListings,
    portfolio: portfolio.value,
    availability: availability.value,
    reviews: reviews.value,
    loadErrors: {
      portfolio: portfolio.error,
      availability: availability.error,
      reviews: reviews.error,
    },
  };
}

async function loadOptionalProviderDetailSection<T>(
  label: string,
  fallback: T,
  loader: () => Promise<T>,
): Promise<{ value: T; error: string | null }> {
  try {
    return { value: await loader(), error: null };
  } catch (error) {
    return {
      value: fallback,
      error:
        error instanceof Error
          ? error.message
          : `Unable to load provider ${label}.`,
    };
  }
}
