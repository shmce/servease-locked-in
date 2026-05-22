import { useMemo } from 'react';
import { CustomerAddressSummary } from '../../../shared/models/types';

export function useCustomerAddressesViewModel({
  addresses,
  busyAction,
}: {
  addresses: CustomerAddressSummary[];
  busyAction: string | null;
}) {
  return useMemo(
    () => ({
      data: {
        addresses: addresses.map((address) => ({
          ...address,
          defaultLabel: address.isDefault ? 'Default home' : 'Saved address',
          settingDefault: busyAction === `default-address-${address.id}`,
          deleting: busyAction === `delete-address-${address.id}`,
        })),
        hasAddresses: addresses.length > 0,
        saveLabel: busyAction === 'save-customer-address' ? 'Saving...' : 'Save address',
      },
      isLoading: false,
      error: null,
    }),
    [addresses, busyAction],
  );
}
