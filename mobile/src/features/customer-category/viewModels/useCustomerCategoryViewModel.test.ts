import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderListing,
} from '../../../shared/models/types';
import { buildCustomerCategoryViewModel } from './useCustomerCategoryViewModel';

const categories: CatalogCategory[] = [
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'Cleaning services',
    icon: null,
  },
  {
    id: 'repairs',
    name: 'Repairs',
    description: 'Repair services',
    icon: null,
  },
];

const services: CatalogServiceItem[] = [
  {
    id: 'deep-clean',
    categoryId: 'cleaning',
    name: 'Deep Clean',
    description: 'Detailed cleaning',
    price: 1200,
    pricingMode: 'flat',
  },
  {
    id: 'pipe-repair',
    categoryId: 'repairs',
    name: 'Pipe Repair',
    description: 'Plumbing repair',
    price: 900,
    pricingMode: 'flat',
  },
];

describe('buildCustomerCategoryViewModel', () => {
  it('shows only services that belong to the selected category', () => {
    const category = buildCustomerCategoryViewModel({
      categories,
      selectedCategoryId: 'repairs',
      services,
    });

    assert.equal(category.data.categoryName, 'Repairs');
    assert.equal(category.data.serviceCountLabel, '1 service available');
    assert.deepEqual(
      category.data.serviceRows.map((row) => row.id),
      ['pipe-repair'],
    );
    assert.equal(
      category.data.categoryRows.find((row) => row.id === 'repairs')?.isSelected,
      true,
    );
  });

  it('shows all services when no category is selected', () => {
    const viewModel = buildCustomerCategoryViewModel({
      categories,
      selectedCategoryId: null,
      services,
    });

    assert.equal(viewModel.data.categoryName, 'Services');
    assert.deepEqual(
      viewModel.data.serviceRows.map((row) => row.id),
      ['deep-clean', 'pipe-repair'],
    );
    assert.equal(viewModel.data.categoryRows[0]?.id, 'all-services');
    assert.equal(viewModel.data.categoryRows[0]?.isSelected, true);
  });

  it('filters category services before pagination', () => {
    const viewModel = buildCustomerCategoryViewModel({
      categories,
      page: 1,
      selectedCategoryId: 'cleaning',
      services: [
        ...Array.from({ length: 6 }, (_, index) => ({
          id: `cleaning-${index + 1}`,
          categoryId: 'cleaning',
          name: `Cleaning ${index + 1}`,
          description: 'Cleaning service',
          price: 500,
          pricingMode: 'flat' as const,
        })),
        {
          id: 'repair-outside-scope',
          categoryId: 'repairs',
          name: 'Repair outside scope',
          description: 'Should not show on a cleaning page',
          price: 600,
          pricingMode: 'flat',
        },
      ],
    });

    assert.deepEqual(
      viewModel.data.serviceRows.map((row) => row.id),
      ['cleaning-1', 'cleaning-2', 'cleaning-3', 'cleaning-4', 'cleaning-5'],
    );
    assert.equal(viewModel.data.pagination.totalItems, 6);
    assert.equal(viewModel.data.pagination.pageLabel, 'Page 1 of 2');
    assert.equal(viewModel.data.pagination.pageSize, 5);
  });

  it('keeps search scoped to the selected category', () => {
    const viewModel = buildCustomerCategoryViewModel({
      categories,
      searchQuery: 'pipe',
      selectedCategoryId: 'cleaning',
      services: [
        {
          id: 'pipe-cleaning',
          categoryId: 'cleaning',
          name: 'Pipe Cleaning',
          description: 'Clean pipes',
          price: 500,
          pricingMode: 'flat',
        },
        {
          id: 'pipe-repair',
          categoryId: 'repairs',
          name: 'Pipe Repair',
          description: 'Repair pipes',
          price: 600,
          pricingMode: 'flat',
        },
      ],
    });

    assert.deepEqual(
      viewModel.data.serviceRows.map((row) => row.id),
      ['pipe-cleaning'],
    );
    assert.equal(viewModel.data.emptyState.title, 'No Cleaning services found');
  });

  it('summarizes provider rating metadata for service comparison cards', () => {
    const viewModel = buildCustomerCategoryViewModel({
      categories,
      providers: [
        provider('provider-1', 'deep-clean', 4.8, 12),
        provider('provider-2', 'deep-clean', 4.2, 8),
        provider('provider-3', 'pipe-repair', 5, 1),
      ],
      selectedCategoryId: 'cleaning',
      services,
    });

    const row = viewModel.data.serviceRows[0];

    assert.equal(row?.name, 'Deep Clean');
    assert.equal(row?.priceLabel, 'PHP 1,200');
    assert.equal(row?.hasRating, true);
    assert.equal(row?.reviewCount, 20);
    assert.equal(row?.ratingLabel, '4.6');
  });
});

function provider(
  id: string,
  serviceId: string,
  averageRating: number,
  reviewCount: number,
): ProviderListing {
  return {
    id,
    providerId: id,
    providerBusinessName: `${id} Business`,
    serviceId,
    title: `${id} service`,
    description: null,
    price: 500,
    pricingMode: 'flat',
    averageRating,
    reviewCount,
    verificationStatus: 'approved',
  };
}
