import { useEffect, useMemo, useState } from 'react';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

const CATEGORY_PAGE_SIZE = 5;

type CategoryRailRow = {
  id: string;
  label: string;
  category: CatalogCategory | null;
  serviceCount: number;
  serviceCountLabel: string;
  isSelected: boolean;
};

type CustomerCategoryViewModelInput = {
  categories: CatalogCategory[];
  page?: number;
  providers?: ProviderListing[];
  searchQuery?: string;
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
};

export function useCustomerCategoryViewModel({
  categories,
  page,
  providers,
  searchQuery,
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  const [currentPage, setCurrentPage] = useState(page ?? 1);

  useEffect(() => {
    setCurrentPage(page ?? 1);
  }, [page, searchQuery, selectedCategoryId, services.length]);

  const viewModel = useMemo(
    () =>
      buildCustomerCategoryViewModel({
        categories,
        page: currentPage,
        providers,
        searchQuery,
        selectedCategoryId,
        services,
      }),
    [categories, currentPage, providers, searchQuery, selectedCategoryId, services],
  );

  return {
    ...viewModel,
    actions: {
      goToNextPage: () =>
        setCurrentPage((nextPage) =>
          Math.min(nextPage + 1, viewModel.data.pagination.totalPages),
        ),
      goToPreviousPage: () =>
        setCurrentPage((nextPage) => Math.max(nextPage - 1, 1)),
      setPage: setCurrentPage,
    },
  };
}

export function buildCustomerCategoryViewModel({
  categories,
  page = 1,
  providers = [],
  searchQuery = '',
  selectedCategoryId,
  services,
}: CustomerCategoryViewModelInput) {
  const categoryName =
    categories.find((category) => category.id === selectedCategoryId)?.name ?? 'Services';
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
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
  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / CATEGORY_PAGE_SIZE));
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const pageStartIndex = (safePage - 1) * CATEGORY_PAGE_SIZE;
  const pageEndIndex = pageStartIndex + CATEGORY_PAGE_SIZE;
  const pageServices = filteredServices.slice(pageStartIndex, pageEndIndex);
  const pageStartLabel = totalItems > 0 ? pageStartIndex + 1 : 0;
  const pageEndLabel = Math.min(pageEndIndex, totalItems);

  const categoryRows: CategoryRailRow[] = [
    {
      id: 'all-services',
      label: 'All',
      category: null,
      serviceCount: services.length,
      serviceCountLabel: formatServiceCount(services.length),
      isSelected: !selectedCategoryId,
    },
    ...categories.map((category) => {
      const serviceCount = services.filter(
        (service) => service.categoryId === category.id,
      ).length;
      return {
        id: category.id,
        label: category.name,
        category,
        serviceCount,
        serviceCountLabel: formatServiceCount(serviceCount),
        isSelected: category.id === selectedCategoryId,
      };
    }),
  ];

  const serviceCountLabel = query
    ? `${formatServiceCount(filteredServices.length)} of ${formatServiceCount(
        categoryServices.length,
      )}`
    : `${formatServiceCount(categoryServices.length)} available`;

  const serviceRows = pageServices.map((service) => {
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
  const emptyScope = categoryName === 'Services' ? 'services' : `${categoryName} services`;
  const emptyState = query
    ? {
        title: `No ${emptyScope} found`,
        body: 'Try a different search term inside this category.',
      }
    : {
        title: `No ${emptyScope} available`,
        body: 'Check back later for services in this category.',
      };

  return {
    data: {
      categoryName,
      categoryDescription:
        selectedCategory?.description ??
        'Browse verified services and choose the right provider for your home.',
      categoryRows,
      emptyState,
      searchPlaceholder:
        categoryName === 'Services'
          ? 'Search all services'
          : `Search ${categoryName.toLowerCase()} services`,
      serviceCountLabel,
      serviceRows,
      hasServices: totalItems > 0,
      pagination: {
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        itemRangeLabel:
          totalItems > 0
            ? `${pageStartLabel}-${pageEndLabel} of ${totalItems}`
            : 'No services to show',
        page: safePage,
        pageLabel: `Page ${safePage} of ${totalPages}`,
        pageSize: CATEGORY_PAGE_SIZE,
        totalItems,
        totalPages,
      },
    },
    isLoading: false,
    error: null,
  };
}

function formatServiceCount(count: number): string {
  return `${count} ${count === 1 ? 'service' : 'services'}`;
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
