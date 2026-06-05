import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import {
  CatalogCategory,
  CatalogServiceItem,
} from '../../../shared/models/types';

export type CustomerServiceBrowseMode = 'all' | 'recommended' | 'search';
export type CustomerServiceSortMode =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc';

type CustomerAllServicesViewModelInput = {
  categories?: CatalogCategory[];
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
  mode?: CustomerServiceBrowseMode;
  page?: number;
  selectedCategoryId?: string | null;
  sortMode?: CustomerServiceSortMode;
};

export type CustomerServiceCategoryFilterOption = {
  id: string | null;
  isSelected: boolean;
  label: string;
  serviceCount: number;
};

export type CustomerServiceSortOption = {
  value: CustomerServiceSortMode;
  label: string;
  description: string;
  isSelected: boolean;
};

const servicesPageSize = 5;
const defaultSortMode: CustomerServiceSortMode = 'default';
const serviceSortOptions: {
  value: CustomerServiceSortMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'default',
    label: 'Default order',
    description: 'Keep the catalog order.',
  },
  {
    value: 'price-asc',
    label: 'Price: low to high',
    description: 'Show lower-priced services first.',
  },
  {
    value: 'price-desc',
    label: 'Price: high to low',
    description: 'Show higher-priced services first.',
  },
  {
    value: 'name-asc',
    label: 'Name A-Z',
    description: 'Sort services alphabetically.',
  },
];

export function useCustomerAllServicesViewModel({
  categories = [],
  services,
  marketplaceSearchQuery,
  mode = 'all',
  selectedCategoryId = null,
  sortMode = defaultSortMode,
}: CustomerAllServicesViewModelInput) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [marketplaceSearchQuery, mode, selectedCategoryId, services.length, sortMode]);

  const viewModel = useMemo(
    () =>
      buildCustomerAllServicesViewModel({
        categories,
        mode,
        page: currentPage,
        services,
        marketplaceSearchQuery,
        selectedCategoryId,
        sortMode,
      }),
    [
      categories,
      currentPage,
      marketplaceSearchQuery,
      mode,
      selectedCategoryId,
      services,
      sortMode,
    ],
  );

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(
    () => {
      setCurrentPage((page) => Math.min(viewModel.data.pagination.totalPages, page + 1));
    },
    [viewModel.data.pagination.totalPages],
  );

  return {
    ...viewModel,
    actions: {
      goToNextPage,
      goToPreviousPage,
    },
  };
}

export function buildCustomerAllServicesViewModel({
  categories = [],
  mode = 'all',
  page = 1,
  services,
  marketplaceSearchQuery,
  selectedCategoryId = null,
  sortMode = defaultSortMode,
}: CustomerAllServicesViewModelInput) {
  const query = marketplaceSearchQuery.trim().toLowerCase();
  const safeSortMode = normalizeSortMode(sortMode);
  const indexedServices = services.map((service, index) => ({ index, service }));
  const queryFilteredServices = indexedServices.filter(({ service }) => {
    if (!query) {
      return true;
    }

    return [service.name, service.description ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    );
  });
  const categoryFilteredServices = selectedCategoryId
    ? queryFilteredServices.filter(
        ({ service }) => service.categoryId === selectedCategoryId,
      )
    : queryFilteredServices;
  const visibleServices = sortIndexedServices(categoryFilteredServices, safeSortMode);
  const pagination = buildPagination(visibleServices.length, page, servicesPageSize);
  const pageServices = visibleServices.slice(pagination.startIndex, pagination.endIndex);
  const modeCopy = copyForMode(mode);
  const categoryOptions = buildCategoryOptions({
    categories,
    selectedCategoryId,
    services,
  });
  const selectedCategoryOption = categoryOptions.find(
    (option) => option.id === selectedCategoryId,
  );
  const sortOptions: CustomerServiceSortOption[] = serviceSortOptions.map((option) => ({
    ...option,
    isSelected: option.value === safeSortMode,
  }));
  const selectedSortOption =
    sortOptions.find((option) => option.value === safeSortMode) ?? sortOptions[0];
  const hasActiveRefinements =
    Boolean(selectedCategoryId) || safeSortMode !== defaultSortMode;
  const categoryLabel = selectedCategoryOption?.label ?? 'Selected category';
  const sortLabel = selectedSortOption?.label ?? serviceSortOptions[0].label;

  return {
    data: {
      categoryFilterOptions: categoryOptions,
      clearRefinementsLabel: 'Clear filters',
      emptyState: {
        title: query ? 'No services found' : modeCopy.emptyTitle,
        body:
          query || hasActiveRefinements
            ? 'Try adjusting your search or filters.'
            : modeCopy.emptyBody,
      },
      filterButtonLabel: hasActiveRefinements
        ? 'Filter services, filters active'
        : 'Filter services',
      hasCategoryFilter: Boolean(selectedCategoryId),
      hasQuery: query.length > 0,
      hasServiceRefinements: hasActiveRefinements,
      hasVisibleServices: visibleServices.length > 0,
      query,
      refinement: {
        activeFilterCount:
          Number(Boolean(selectedCategoryId)) +
          Number(safeSortMode !== defaultSortMode),
        categoryLabel,
        hasActiveRefinements,
        sortLabel,
        summary: buildRefinementSummary({
          categoryLabel,
          hasCategoryFilter: Boolean(selectedCategoryId),
          sortLabel,
          sortMode: safeSortMode,
        }),
      },
      resultCount: visibleServices.length,
      selectedCategoryId,
      selectedCategoryLabel: categoryLabel,
      selectedSortLabel: sortLabel,
      serviceResultLabel:
        visibleServices.length === 1
          ? '1 service'
          : `${visibleServices.length} services`,
      sortMode: safeSortMode,
      sortOptions,
      title: modeCopy.title,
      totalServiceCount: services.length,
      visibleServices: pageServices.map(({ service }) => ({
        service,
        description: service.description ?? 'Bookable service',
        priceLabel: `From ${formatMoney(service.price)}`,
      })),
      pagination: {
        currentPage: pagination.currentPage,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPreviousPage: pagination.currentPage > 1,
        pageLabel:
          pagination.totalItems > 0
            ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
            : 'No services',
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
    },
    isLoading: false,
    error: null,
  };
}

function normalizeSortMode(sortMode: CustomerServiceSortMode): CustomerServiceSortMode {
  return serviceSortOptions.some((option) => option.value === sortMode)
    ? sortMode
    : defaultSortMode;
}

function sortIndexedServices(
  services: { index: number; service: CatalogServiceItem }[],
  sortMode: CustomerServiceSortMode,
) {
  if (sortMode === 'default') {
    return services;
  }

  return [...services].sort((a, b) => {
    if (sortMode === 'name-asc') {
      return a.service.name.localeCompare(b.service.name) || a.index - b.index;
    }

    const priceDelta = compareNullablePrice(
      a.service.price,
      b.service.price,
      sortMode === 'price-desc' ? 'desc' : 'asc',
    );
    return priceDelta || a.index - b.index;
  });
}

function compareNullablePrice(
  aPrice: number | null,
  bPrice: number | null,
  direction: 'asc' | 'desc',
) {
  const aHasPrice = typeof aPrice === 'number' && Number.isFinite(aPrice);
  const bHasPrice = typeof bPrice === 'number' && Number.isFinite(bPrice);

  if (aHasPrice && bHasPrice) {
    return direction === 'asc'
      ? aPrice - bPrice
      : bPrice - aPrice;
  }

  if (aHasPrice !== bHasPrice) {
    return aHasPrice ? -1 : 1;
  }

  return 0;
}

function buildCategoryOptions({
  categories,
  selectedCategoryId,
  services,
}: {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  services: CatalogServiceItem[];
}): CustomerServiceCategoryFilterOption[] {
  const countsByCategoryId = new Map<string, number>();
  services.forEach((service) => {
    if (!service.categoryId) {
      return;
    }

    countsByCategoryId.set(
      service.categoryId,
      (countsByCategoryId.get(service.categoryId) ?? 0) + 1,
    );
  });

  const categoryIds = new Set<string>();
  const options: CustomerServiceCategoryFilterOption[] = [
    {
      id: null,
      isSelected: selectedCategoryId === null,
      label: 'All categories',
      serviceCount: services.length,
    },
  ];

  categories.forEach((category) => {
    const serviceCount = countsByCategoryId.get(category.id) ?? 0;
    if (serviceCount <= 0) {
      return;
    }

    categoryIds.add(category.id);
    options.push({
      id: category.id,
      isSelected: category.id === selectedCategoryId,
      label: categoryLabel(category),
      serviceCount,
    });
  });

  Array.from(countsByCategoryId.keys())
    .filter((categoryId) => !categoryIds.has(categoryId))
    .sort()
    .forEach((categoryId) => {
      options.push({
        id: categoryId,
        isSelected: categoryId === selectedCategoryId,
        label: fallbackCategoryLabel(categoryId),
        serviceCount: countsByCategoryId.get(categoryId) ?? 0,
      });
    });

  return options;
}

function categoryLabel(category: CatalogCategory) {
  return category.name.trim() || 'Unnamed category';
}

function fallbackCategoryLabel(categoryId: string) {
  const words = categoryId
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`);

  return words.length > 0 ? words.join(' ') : 'Other services';
}

function buildRefinementSummary({
  categoryLabel,
  hasCategoryFilter,
  sortLabel,
  sortMode,
}: {
  categoryLabel: string;
  hasCategoryFilter: boolean;
  sortLabel: string;
  sortMode: CustomerServiceSortMode;
}) {
  const labels: string[] = [];
  if (hasCategoryFilter) {
    labels.push(categoryLabel);
  }
  if (sortMode !== defaultSortMode) {
    labels.push(sortLabel);
  }

  return labels.length > 0 ? labels.join(' - ') : 'All services';
}

function buildPagination(totalItems: number, requestedPage: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    endIndex: startIndex + pageSize,
    startIndex,
    totalItems,
    totalPages,
  };
}

function copyForMode(mode: CustomerServiceBrowseMode) {
  if (mode === 'recommended') {
    return {
      emptyBody: 'Recommended services will appear as providers build up marketplace activity.',
      emptyTitle: 'No recommendations yet',
      title: 'Recommended Services',
    };
  }

  if (mode === 'search') {
    return {
      emptyBody: 'Try searching with different keywords.',
      emptyTitle: 'No services found',
      title: 'Search Results',
    };
  }

  return {
    emptyBody: 'Check back soon for more bookable services.',
    emptyTitle: 'No services available',
    title: 'All Services',
  };
}
