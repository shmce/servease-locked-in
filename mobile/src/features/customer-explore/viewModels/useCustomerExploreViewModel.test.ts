import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { buildCustomerExploreViewModel } from './useCustomerExploreViewModel';

const categories: CatalogCategory[] = [
  {
    id: 'quiet',
    name: 'Quiet Category',
    description: null,
    icon: null,
  },
  {
    id: 'busy',
    name: 'Busy Category',
    description: null,
    icon: null,
  },
  {
    id: 'premium',
    name: 'Premium Category',
    description: null,
    icon: null,
  },
  {
    id: 'single-review',
    name: 'Single Review Category',
    description: null,
    icon: null,
  },
];

const services: CatalogServiceItem[] = [
  service('quiet-service', 'quiet'),
  service('busy-service', 'busy'),
  service('premium-service', 'premium'),
  service('single-review-service', 'single-review'),
];

describe('buildCustomerExploreViewModel ranking', () => {
  it('sorts popular categories by log-compressed catalog volume', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      categoryFilter: 'popular',
      providers: [
        provider('quiet-provider', 'quiet-service', 4.8, 20),
        provider('busy-provider-1', 'busy-service', 4.4, 4),
        provider('busy-provider-2', 'busy-service', 4.3, 8),
        provider('busy-provider-3', 'busy-service', 4.2, 11),
      ],
    });

    assert.deepEqual(
      explore.data.categoryRows.map((row) => row.id).slice(0, 2),
      ['busy', 'quiet'],
    );
  });

  it('sorts top rated categories by Bayesian rating instead of raw review volume', () => {
    const explore = buildCustomerExploreViewModel({
      ...baseInput(),
      categoryFilter: 'top-rated',
      providers: [
        provider('popular-lower-rated', 'busy-service', 4.7, 100),
        provider('premium-strong-rated', 'premium-service', 4.95, 20),
        provider('single-five-star', 'single-review-service', 5, 1),
      ],
    });

    assert.deepEqual(
      explore.data.categoryRows.map((row) => row.id).slice(0, 3),
      ['premium', 'busy', 'single-review'],
    );
  });
});

function baseInput() {
  return {
    bookings: [],
    categories,
    customerGuideDismissed: true,
    customerGuideStep: 0,
    profile: null,
    providers: [],
    selectedCategoryId: null,
    selectedProviderId: null,
    selectedServiceId: null,
    services,
    unreadCount: 0,
  };
}

function service(id: string, categoryId: string): CatalogServiceItem {
  return {
    id,
    categoryId,
    name: id,
    description: null,
    price: 1000,
    pricingMode: 'flat',
  };
}

function provider(
  id: string,
  serviceId: string,
  averageRating: number,
  reviewCount: number,
): ProviderListing {
  return {
    id,
    providerId: id,
    providerBusinessName: id,
    serviceId,
    title: id,
    description: null,
    price: 1000,
    pricingMode: 'flat',
    averageRating,
    reviewCount,
    verificationStatus: 'approved',
  };
}
