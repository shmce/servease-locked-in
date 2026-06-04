import assert from 'node:assert/strict';
import test from 'node:test';
import {
  confirmCustomerBookingPin,
  createCustomerBookingLocationState,
  moveCustomerBookingPendingPin,
} from '../../../domain/customerBookingLocation';
import type { CustomerAddressSummary } from '../../../shared/models/types';
import { buildCustomerAddressPinPayload } from './customerAddressPinPayload';
import { buildCustomerAddressesViewModel } from './useCustomerAddressesViewModel';

const verifiedHomeAddress: CustomerAddressSummary = {
  id: 'address-home',
  userId: 'customer-1',
  label: 'Home',
  address: 'The Beacon, Makati',
  barangay: null,
  city: 'Makati',
  province: null,
  region: 'NCR',
  latitude: 14.554729,
  longitude: 121.024445,
  isDefault: true,
  createdAt: null,
  updatedAt: null,
};

const unverifiedWorkAddress: CustomerAddressSummary = {
  ...verifiedHomeAddress,
  id: 'address-work',
  label: 'Work',
  address: 'Ayala Avenue, Makati',
  latitude: null,
  longitude: null,
  isDefault: false,
};

test('saved-address view model marks verified and unverified pins', () => {
  const model = buildCustomerAddressesViewModel({
    addresses: [verifiedHomeAddress, unverifiedWorkAddress],
    busyAction: null,
  });

  assert.equal(model.data.hasAddresses, true);
  assert.equal(model.data.addresses[0]?.isPinVerified, true);
  assert.equal(model.data.addresses[0]?.verificationLabel, 'Verified pin');
  assert.equal(model.data.addresses[0]?.pinActionLabel, 'Edit pin');
  assert.equal(model.data.addresses[0]?.defaultLabel, 'Default home');
  assert.equal(model.data.addresses[0]?.pinCoordinateLabel, '14.55473, 121.02445');
  assert.equal(model.data.addresses[1]?.isPinVerified, false);
  assert.equal(model.data.addresses[1]?.verificationLabel, 'Needs pin');
  assert.equal(model.data.addresses[1]?.pinActionLabel, 'Verify pin');
  assert.equal(model.data.addresses[1]?.pinCoordinateLabel, null);
});

test('saved-address view model preserves existing busy actions', () => {
  const settingDefault = buildCustomerAddressesViewModel({
    addresses: [unverifiedWorkAddress],
    busyAction: 'default-address-address-work',
  });
  const deleting = buildCustomerAddressesViewModel({
    addresses: [unverifiedWorkAddress],
    busyAction: 'delete-address-address-work',
  });
  const updating = buildCustomerAddressesViewModel({
    addresses: [unverifiedWorkAddress],
    busyAction: 'update-customer-address-address-work',
    editTargetId: 'address-work',
  });

  assert.equal(settingDefault.data.addresses[0]?.settingDefault, true);
  assert.equal(deleting.data.addresses[0]?.deleting, true);
  assert.equal(updating.data.addresses[0]?.isPinActionBusy, true);
  assert.equal(updating.data.isSavingAddress, true);
  assert.equal(updating.data.saveLabel, 'Saving...');
});

test('saved-address pin payload requires a confirmed pin', () => {
  const emptyState = createCustomerBookingLocationState('');

  assert.equal(
    buildCustomerAddressPinPayload({
      draftLabel: 'Home',
      serviceLocation: emptyState,
    }),
    null,
  );
});

test('saved-address pin payload includes coordinates from confirmed pin', () => {
  const pending = moveCustomerBookingPendingPin(
    createCustomerBookingLocationState(''),
    14.554729,
    121.024445,
    'The Beacon, Chino Roces Makati',
  );
  const confirmed = confirmCustomerBookingPin(
    pending,
    'The Beacon, Chino Roces Makati - Tower 1 lobby',
  );

  assert.deepEqual(
    buildCustomerAddressPinPayload({
      draftLabel: '  Condo  ',
      serviceLocation: confirmed,
    }),
    {
      address: 'The Beacon, Chino Roces Makati - Tower 1 lobby',
      label: 'Condo',
      latitude: 14.554729,
      longitude: 121.024445,
    },
  );
});
