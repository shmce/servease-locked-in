import { useMemo } from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import { CatalogServiceItem } from '../../../shared/models/types';

type CustomerAllServicesViewModelInput = {
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
};

export function useCustomerAllServicesViewModel({
  services,
  marketplaceSearchQuery,
}: CustomerAllServicesViewModelInput) {
  return useMemo(
    () =>
      buildCustomerAllServicesViewModel({
        services,
        marketplaceSearchQuery,
      }),
    [marketplaceSearchQuery, services],
  );
}

export function buildCustomerAllServicesViewModel({
  services,
  marketplaceSearchQuery,
}: CustomerAllServicesViewModelInput) {
  const query = marketplaceSearchQuery.trim().toLowerCase();
  const visibleServices = services.filter((service) => {
    if (!query) {
      return true;
    }

    return [service.name, service.description ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  return {
    data: {
      visibleServices: visibleServices.map((service) => ({
        service,
        initial: service.name.slice(0, 1),
        description: service.description ?? 'Bookable service',
        ratingLabel: '4.8',
        priceLabel: `From ${formatMoney(service.price)}`,
      })),
      hasVisibleServices: visibleServices.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
