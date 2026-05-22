import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProviderServicesViewModel } from './useProviderServicesViewModel';

test('pending providers cannot manage marketplace services', () => {
  const viewModel = buildProviderServicesViewModel({
    ownedServices: [
      {
        id: 'owned-service-1',
        providerId: 'provider-1',
        providerBusinessName: 'GreenFix',
        serviceId: 'catalog-service-1',
        title: 'Aircon cleaning',
        description: null,
        price: 1500,
        pricingMode: 'flat',
        averageRating: 0,
        reviewCount: 0,
        verificationStatus: 'pending',
        isActive: true,
      },
    ],
    editingServiceId: null,
    newServicePricingMode: 'flat',
    busyAction: null,
    providerVerificationStatus: 'pending',
  });

  assert.equal(viewModel.data.canManageServices, false);
  assert.equal(viewModel.data.isServiceManagementLocked, true);
  assert.equal(
    viewModel.data.lockedTitle,
    'Application approval required',
  );
  assert.match(viewModel.data.lockedBody, /government ID/i);
  assert.equal(viewModel.data.serviceRows[0].canEdit, false);
  assert.equal(viewModel.data.serviceRows[0].isToggleDisabled, true);
  assert.equal(viewModel.data.serviceRows[0].isRemoveDisabled, true);
  assert.equal(viewModel.data.isSaveNewServiceDisabled, true);
});
