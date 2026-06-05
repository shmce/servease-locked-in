import { useMemo } from 'react';
import { CustomerAddressSummary } from '../../../shared/models/types';

type CustomerAddressesViewModelInput = {
  addresses: CustomerAddressSummary[];
  busyAction: string | null;
  editTargetId?: string | null;
  isComposerOpen?: boolean;
};

export function useCustomerAddressesViewModel({
  addresses,
  busyAction,
  editTargetId = null,
  isComposerOpen = false,
}: CustomerAddressesViewModelInput) {
  return useMemo(
    () =>
      buildCustomerAddressesViewModel({
        addresses,
        busyAction,
        editTargetId,
        isComposerOpen,
      }),
    [addresses, busyAction, editTargetId, isComposerOpen],
  );
}

export function buildCustomerAddressesViewModel({
  addresses,
  busyAction,
  editTargetId = null,
  isComposerOpen = false,
}: CustomerAddressesViewModelInput) {
  const isSavingNewAddress = busyAction === 'save-customer-address';
  const isUpdatingEditedAddress =
    editTargetId !== null &&
    busyAction === `update-customer-address-${editTargetId}`;

  return {
    data: {
      addresses: addresses.map((address) => {
        const isPinVerified =
          address.latitude !== null && address.longitude !== null;
        const isPinActionBusy =
          busyAction === `update-customer-address-${address.id}`;

        return {
          ...address,
          defaultLabel: address.isDefault ? 'Default home' : 'Saved address',
          deleting: busyAction === `delete-address-${address.id}`,
          isPinActionBusy,
          isPinVerified,
          pinActionLabel: isPinVerified ? 'Edit pin' : 'Verify pin',
          pinCoordinateLabel: isPinVerified
            ? `${address.latitude?.toFixed(5)}, ${address.longitude?.toFixed(5)}`
            : null,
          settingDefault: busyAction === `default-address-${address.id}`,
          verificationLabel: isPinVerified ? 'Verified pin' : 'Needs pin',
        };
      }),
      hasAddresses: addresses.length > 0,
      isComposerOpen,
      isSavingAddress: isSavingNewAddress || isUpdatingEditedAddress,
      saveLabel:
        isSavingNewAddress || isUpdatingEditedAddress
          ? 'Saving...'
          : editTargetId
            ? 'Update saved address'
            : 'Save address',
    },
    isLoading: false,
    error: null,
  };
}
