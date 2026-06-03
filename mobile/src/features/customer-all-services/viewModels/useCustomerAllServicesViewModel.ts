import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { formatMoney } from '../../../shared/utils/booking';
import { CatalogServiceItem } from '../../../shared/models/types';

export type CustomerServiceBrowseMode = 'all' | 'recommended' | 'search';

type CustomerAllServicesViewModelInput = {
  services: CatalogServiceItem[];
  marketplaceSearchQuery: string;
  mode?: CustomerServiceBrowseMode;
  page?: number;
};

const servicesPageSize = 5;

export function useCustomerAllServicesViewModel({
  services,
  marketplaceSearchQuery,
  mode = 'all',
}: CustomerAllServicesViewModelInput) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [marketplaceSearchQuery, mode, services.length]);

  const viewModel = useMemo(
    () =>
      buildCustomerAllServicesViewModel({
        mode,
        page: currentPage,
        services,
        marketplaceSearchQuery,
      }),
    [currentPage, marketplaceSearchQuery, mode, services],
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
  mode = 'all',
  page = 1,
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
  const pagination = buildPagination(visibleServices.length, page, servicesPageSize);
  const pageServices = visibleServices.slice(pagination.startIndex, pagination.endIndex);
  const modeCopy = copyForMode(mode);

  return {
    data: {
      emptyState: {
        title: query ? 'No services found' : modeCopy.emptyTitle,
        body: query ? 'Try searching with different keywords.' : modeCopy.emptyBody,
      },
      title: modeCopy.title,
      visibleServices: pageServices.map((service) => ({
        service,
        description: service.description ?? 'Bookable service',
        priceLabel: `From ${formatMoney(service.price)}`,
      })),
      hasVisibleServices: visibleServices.length > 0,
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
