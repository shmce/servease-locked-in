import { useMemo } from 'react';
import { ProviderListing } from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

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
  const visibleProviders = providers.filter((provider) => {
    if (!query) return true;
    return [
      provider.providerBusinessName ?? '',
      provider.title,
      provider.description ?? '',
    ].some((value) => value.toLowerCase().includes(query));
  });

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
