import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CatalogCategory,
  CatalogServiceItem,
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
    assert.equal(category.data.serviceCountLabel, '1 services available');
    assert.deepEqual(
      category.data.serviceRows.map((row) => row.id),
      ['pipe-repair'],
    );
  });
});
