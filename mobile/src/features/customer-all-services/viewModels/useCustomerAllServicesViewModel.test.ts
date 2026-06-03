import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CatalogServiceItem } from '../../../shared/models/types';
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

  it('resets pagination when mode, query, or service count changes', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/customer-all-services/viewModels/useCustomerAllServicesViewModel.ts',
      ),
      'utf8',
    );

    assert.match(source, /setCurrentPage\(1\);/);
    assert.match(source, /\[marketplaceSearchQuery, mode, services\.length\]/);
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
    assert.match(appSource, /navigate\('customerRecommendedServices', 'customer'\)/);
  });
});

function service(id: string, name = id): CatalogServiceItem {
  return {
    id,
    categoryId: 'category-1',
    name,
    description: `${name} description`,
    price: 500,
    pricingMode: 'flat',
  };
}
