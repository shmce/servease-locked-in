import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ProviderListing } from '../../../shared/models/types';
import { buildCustomerTopProvidersViewModel } from './useCustomerTopProvidersViewModel';

describe('buildCustomerTopProvidersViewModel', () => {
  it('sorts providers by confidence-weighted rating', () => {
    const topProviders = buildCustomerTopProvidersViewModel({
      marketplaceSearchQuery: '',
      providers: [
        provider('new-five-star', 5, 1),
        provider('trusted-top-rated', 4.96, 80),
        provider('busy-lower-rated', 4.7, 100),
      ],
    });

    assert.deepEqual(
      topProviders.data.providerRows.map((row) => row.id),
      ['trusted-top-rated', 'busy-lower-rated', 'new-five-star'],
    );
  });
});

function provider(
  id: string,
  averageRating: number,
  reviewCount: number,
): ProviderListing {
  return {
    id,
    providerId: id,
    providerBusinessName: id,
    serviceId: 'service-1',
    title: id,
    description: null,
    price: 1000,
    pricingMode: 'flat',
    averageRating,
    reviewCount,
    verificationStatus: 'approved',
  };
}
