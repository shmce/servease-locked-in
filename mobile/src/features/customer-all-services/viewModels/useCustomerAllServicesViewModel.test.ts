import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CatalogCategory, CatalogServiceItem } from '../../../shared/models/types';
import { buildCustomerAllServicesViewModel } from './useCustomerAllServicesViewModel';

describe('buildCustomerAllServicesViewModel', () => {
  it('shows five all-services rows per page', () => {
    const firstPage = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      mode: 'all',
      page: 1,
      services: Array.from({ length: 7 }, (_, index) => service(`service-${index + 1}`)),
    });
    const secondPage = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      mode: 'all',
      page: 2,
      services: Array.from({ length: 7 }, (_, index) => service(`service-${index + 1}`)),
    });

    assert.deepEqual(
      firstPage.data.visibleServices.map((row) => row.service.id),
      ['service-1', 'service-2', 'service-3', 'service-4', 'service-5'],
    );
    assert.deepEqual(
      secondPage.data.visibleServices.map((row) => row.service.id),
      ['service-6', 'service-7'],
    );
    assert.equal(firstPage.data.pagination.pageLabel, 'Page 1 of 2');
    assert.equal(firstPage.data.pagination.hasNextPage, true);
  });

  it('filters search results and keeps at most five rows visible', () => {
    const viewModel = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: 'clean',
      mode: 'search',
      page: 1,
      services: [
        service('clean-1', 'Home Cleaning'),
        service('clean-2', 'Deep Cleaning'),
        service('clean-3', 'Window Cleaning'),
        service('clean-4', 'Office Cleaning'),
        service('clean-5', 'Move-out Cleaning'),
        service('clean-6', 'Post-renovation Cleaning'),
        service('repair-1', 'Minor Repairs'),
      ],
    });

    assert.equal(viewModel.data.title, 'Search Results');
    assert.equal(viewModel.data.visibleServices.length, 5);
    assert.equal(viewModel.data.pagination.totalItems, 6);
  });

  it('uses recommended mode copy', () => {
    const viewModel = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      mode: 'recommended',
      services: [],
    });

    assert.equal(viewModel.data.title, 'Recommended Services');
    assert.equal(viewModel.data.emptyState.title, 'No recommendations yet');
  });

  it('filters services by selected category', () => {
    const viewModel = buildCustomerAllServicesViewModel({
      categories: [
        category('cleaning', 'Cleaning'),
        category('repairs', 'Repairs'),
      ],
      marketplaceSearchQuery: '',
      selectedCategoryId: 'cleaning',
      services: [
        service('cleaning-1', 'Home Cleaning', { categoryId: 'cleaning' }),
        service('repair-1', 'Minor Repairs', { categoryId: 'repairs' }),
      ],
    });

    assert.deepEqual(
      viewModel.data.visibleServices.map((row) => row.service.id),
      ['cleaning-1'],
    );
    assert.equal(viewModel.data.refinement.categoryLabel, 'Cleaning');
    assert.equal(viewModel.data.refinement.summary, 'Cleaning');
    assert.equal(viewModel.data.categoryFilterOptions[1]?.serviceCount, 1);
  });

  it('sorts services by supported price and name modes', () => {
    const services = [
      service('premium', 'Premium Cleaning', { price: 900 }),
      service('budget', 'Budget Cleaning', { price: 200 }),
      service('quote', 'Custom Quote', { price: null }),
    ];
    const priceAsc = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      services,
      sortMode: 'price-asc',
    });
    const priceDesc = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      services,
      sortMode: 'price-desc',
    });
    const nameAsc = buildCustomerAllServicesViewModel({
      marketplaceSearchQuery: '',
      services,
      sortMode: 'name-asc',
    });

    assert.deepEqual(
      priceAsc.data.visibleServices.map((row) => row.service.id),
      ['budget', 'premium', 'quote'],
    );
    assert.deepEqual(
      priceDesc.data.visibleServices.map((row) => row.service.id),
      ['premium', 'budget', 'quote'],
    );
    assert.deepEqual(
      nameAsc.data.visibleServices.map((row) => row.service.id),
      ['budget', 'quote', 'premium'],
    );
  });

  it('combines text search with category filtering and sorting before pagination', () => {
    const viewModel = buildCustomerAllServicesViewModel({
      categories: [category('cleaning', 'Cleaning')],
      marketplaceSearchQuery: 'clean',
      selectedCategoryId: 'cleaning',
      services: [
        service('cleaning-low', 'Quick Cleaning', {
          categoryId: 'cleaning',
          price: 300,
        }),
        service('repair-clean', 'Clean Fixture Repair', {
          categoryId: 'repairs',
          price: 200,
        }),
        service('cleaning-high', 'Deep Cleaning', {
          categoryId: 'cleaning',
          price: 800,
        }),
      ],
      sortMode: 'price-desc',
    });

    assert.deepEqual(
      viewModel.data.visibleServices.map((row) => row.service.id),
      ['cleaning-high', 'cleaning-low'],
    );
    assert.equal(viewModel.data.pagination.totalItems, 2);
    assert.equal(viewModel.data.refinement.summary, 'Cleaning - Price: high to low');
  });

  it('uses refined empty state copy without clearing filters', () => {
    const viewModel = buildCustomerAllServicesViewModel({
      categories: [category('repairs', 'Repairs')],
      marketplaceSearchQuery: '',
      selectedCategoryId: 'repairs',
      services: [
        service('cleaning-1', 'Home Cleaning', { categoryId: 'cleaning' }),
      ],
    });

    assert.equal(viewModel.data.hasVisibleServices, false);
    assert.equal(viewModel.data.emptyState.body, 'Try adjusting your search or filters.');
    assert.equal(viewModel.data.selectedCategoryId, 'repairs');
  });

  it('resets pagination when mode, query, service count, category, or sort changes', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/customer-all-services/viewModels/useCustomerAllServicesViewModel.ts',
      ),
      'utf8',
    );

    assert.match(source, /setCurrentPage\(1\);/);
    assert.match(
      source,
      /\[marketplaceSearchQuery, mode, selectedCategoryId, services\.length, sortMode\]/,
    );
  });

  it('keeps category browse-all on the customer category route', () => {
    const exploreSource = readFileSync(
      join(process.cwd(), 'src/features/customer-explore/views/CustomerExplore.tsx'),
      'utf8',
    );
    const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
    const handleSeeAllStart = exploreSource.indexOf('function handleSeeAllCategory');
    const handleRecommendationStart = exploreSource.indexOf(
      'function handleRecommendationPress',
    );
    const handleSeeAllSource = exploreSource.slice(
      handleSeeAllStart,
      handleRecommendationStart,
    );

    assert.match(handleSeeAllSource, /props\.onSelectCategory\(sheetCategory\)/);
    assert.doesNotMatch(handleSeeAllSource, /onViewAllServices/);
    assert.doesNotMatch(exploreSource, /CategoryFilterSheet|setCategoryFilter/);
    assert.match(appSource, /navigate\('customerRecommendedServices', 'customer'\)/);
  });
});

function category(id: string, name: string): CatalogCategory {
  return {
    id,
    name,
    description: null,
    icon: null,
  };
}

function service(
  id: string,
  name = id,
  overrides: Partial<CatalogServiceItem> = {},
): CatalogServiceItem {
  return {
    id,
    categoryId: overrides.categoryId ?? 'category-1',
    name,
    description: overrides.description ?? `${name} description`,
    price: 'price' in overrides ? overrides.price ?? null : 500,
    pricingMode: overrides.pricingMode ?? 'flat',
  };
}
