import { useMemo } from 'react';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

type CustomerCategoryViewModelInput = {
  categories: CatalogCategory[];
  providers?: ProviderListing[];
  searchQuery?: string;
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
};

export function useCustomerCategoryViewModel({
  categories,
  providers,
  searchQuery,
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  return useMemo(
    () =>
      buildCustomerCategoryViewModel({
        categories,
        providers,
        searchQuery,
        selectedCategoryId,
        services,
      }),
    [categories, providers, searchQuery, selectedCategoryId, services],
  );
}

export function buildCustomerCategoryViewModel({
  categories,
  providers = [],
  searchQuery = '',
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  const categoryName =
    categories.find((category) => category.id === selectedCategoryId)?.name ?? 'Services';
  const serviceRatings = buildServiceRatings(providers);
  const query = searchQuery.trim().toLowerCase();

  const categoryServices = selectedCategoryId
    ? services.filter((service) => service.categoryId === selectedCategoryId)
    : services;

  const filteredServices = categoryServices.filter((service) => {
    if (!query) return true;
    return [service.name, service.description ?? ''].some((s) =>
      s.toLowerCase().includes(query),
    );
  });

  const serviceCountLabel =
    query
      ? `${filteredServices.length} of ${categoryServices.length} services`
      : `${categoryServices.length} services available`;

  const serviceRows = filteredServices.map((service) => {
    const rating = serviceRatings.get(service.id);
    return {
      service,
      id: service.id,
      name: service.name,
      description: service.description ?? 'Professional service available through ServEase.',
      priceLabel: formatMoney(service.price),
      ratingLabel: rating ? rating.avg.toFixed(1) : '0.0',
      ratingValue: rating?.avg ?? 0,
      reviewCount: rating?.reviewCount ?? 0,
      hasRating: (rating?.reviewCount ?? 0) > 0,
    };
  });

  return {
    data: {
      categoryName,
      serviceCountLabel,
      serviceRows,
      hasServices: filteredServices.length > 0,
    },
    isLoading: false,
    error: null,
  };
}

function buildServiceRatings(
  providers: ProviderListing[],
): Map<string, { avg: number; reviewCount: number }> {
  const acc = new Map<string, { weightedSum: number; totalReviews: number }>();
  providers.forEach((p) => {
    if (!p.serviceId || p.reviewCount === 0) return;
    const entry = acc.get(p.serviceId) ?? { weightedSum: 0, totalReviews: 0 };
    acc.set(p.serviceId, {
      weightedSum: entry.weightedSum + p.averageRating * p.reviewCount,
      totalReviews: entry.totalReviews + p.reviewCount,
    });
  });
  const ratings = new Map<string, { avg: number; reviewCount: number }>();
  acc.forEach(({ weightedSum, totalReviews }, serviceId) => {
    ratings.set(serviceId, {
      avg: totalReviews > 0 ? weightedSum / totalReviews : 0,
      reviewCount: totalReviews,
    });
  });
  return ratings;
}
