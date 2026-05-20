import { useMemo } from 'react';
import { ProviderListing } from '../../../shared/models/types';

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
    if (!query) {
      return true;
    }

    return [
      provider.providerBusinessName ?? '',
      provider.title,
      provider.description ?? '',
    ].some((value) => value.toLowerCase().includes(query));
  });

  return {
    data: {
      visibleProviders,
      hasVisibleProviders: visibleProviders.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
