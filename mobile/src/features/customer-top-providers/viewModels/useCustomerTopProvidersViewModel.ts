import { useMemo } from 'react';
import { ProviderListing } from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

const TOP_RATED_MIN_REVIEWS = 10;
const DEFAULT_PLATFORM_AVERAGE_RATING = 4.5;

type CustomerTopProvidersViewModelInput = {
  providers: ProviderListing[];
  marketplaceSearchQuery: string;
};

export function useCustomerTopProvidersViewModel({
  providers,
  marketplaceSearchQuery,
}: CustomerTopProvidersViewModelInput) {
  return useMemo(
    () =>
      buildCustomerTopProvidersViewModel({
        providers,
        marketplaceSearchQuery,
      }),
    [marketplaceSearchQuery, providers],
  );
}

export function buildCustomerTopProvidersViewModel({
  providers,
  marketplaceSearchQuery,
}: CustomerTopProvidersViewModelInput) {
  const query = marketplaceSearchQuery.trim().toLowerCase();
  const visibleProviders = sortProvidersByTrustedRating(
    providers.filter((provider) => {
      if (!query) return true;
      return [
        provider.providerBusinessName ?? '',
        provider.title,
        provider.description ?? '',
      ].some((value) => value.toLowerCase().includes(query));
    }),
  );

  const providerRows = visibleProviders.map((provider) => ({
    provider,
    id: provider.id,
    initial: (provider.providerBusinessName ?? provider.title).slice(0, 1).toUpperCase(),
    name: provider.providerBusinessName ?? provider.title,
    serviceTitle: provider.title,
    description: provider.description ?? provider.title,
    priceLabel: formatMoney(provider.price),
    ratingLabel: provider.averageRating.toFixed(1),
    ratingValue: provider.averageRating,
    reviewCount: provider.reviewCount,
    hasRating: provider.reviewCount > 0,
    isVerified: provider.verificationStatus === 'approved',
  }));

  return {
    data: {
      providerRows,
      visibleProviders,
      hasVisibleProviders: visibleProviders.length > 0,
    },
    isLoading: false,
    error: null,
  };
}

function sortProvidersByTrustedRating(providers: ProviderListing[]): ProviderListing[] {
  const platformReviewCount = providers.reduce(
    (total, provider) => total + Math.max(provider.reviewCount, 0),
    0,
  );
  const platformWeightedSum = providers.reduce(
    (total, provider) =>
      total + provider.averageRating * Math.max(provider.reviewCount, 0),
    0,
  );
  const observedPlatformAverage =
    platformReviewCount > 0
      ? platformWeightedSum / platformReviewCount
      : DEFAULT_PLATFORM_AVERAGE_RATING;
  const platformAverage = Math.min(
    observedPlatformAverage,
    DEFAULT_PLATFORM_AVERAGE_RATING,
  );

  return [...providers].sort((a, b) => {
    const scoreDelta =
      trustedRatingScore(b, platformAverage) - trustedRatingScore(a, platformAverage);
    if (scoreDelta !== 0) return scoreDelta;
    const reviewDelta = b.reviewCount - a.reviewCount;
    if (reviewDelta !== 0) return reviewDelta;
    const ratingDelta = b.averageRating - a.averageRating;
    if (ratingDelta !== 0) return ratingDelta;
    return (a.providerBusinessName ?? a.title).localeCompare(
      b.providerBusinessName ?? b.title,
    );
  });
}

function trustedRatingScore(
  provider: ProviderListing,
  platformAverage: number,
): number {
  if (provider.reviewCount <= 0) return 0;
  const confidenceWeight =
    provider.reviewCount / (provider.reviewCount + TOP_RATED_MIN_REVIEWS);
  const priorWeight =
    TOP_RATED_MIN_REVIEWS / (provider.reviewCount + TOP_RATED_MIN_REVIEWS);
  return confidenceWeight * provider.averageRating + priorWeight * platformAverage;
}
