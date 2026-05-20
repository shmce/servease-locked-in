import { useMemo } from 'react';
import {
  CatalogCategory,
  CatalogServiceItem,
} from '../../../shared/models/types';

type CustomerCategoryViewModelInput = {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
};

export function useCustomerCategoryViewModel({
  categories,
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  return useMemo(
    () =>
      buildCustomerCategoryViewModel({
        categories,
        selectedCategoryId,
        services,
      }),
    [categories, selectedCategoryId, services],
  );
}

export function buildCustomerCategoryViewModel({
  categories,
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  const categoryName =
    categories.find((category) => category.id === selectedCategoryId)?.name ??
    'Services';
  const serviceCountLabel = `${services.length} services available`;

  return {
    data: {
      categoryName,
      serviceCountLabel,
      services,
      hasServices: services.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
