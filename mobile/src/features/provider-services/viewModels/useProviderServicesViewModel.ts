import { useMemo } from 'react';
import {
  BookingPricingMode,
  ProviderOwnedServiceSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

type ProviderServicesViewModelInput = {
  ownedServices: ProviderOwnedServiceSummary[];
  editingServiceId: string | null;
  newServicePricingMode: BookingPricingMode;
  busyAction: string | null;
};

export function useProviderServicesViewModel({
  ownedServices,
  editingServiceId,
  newServicePricingMode,
  busyAction,
}: ProviderServicesViewModelInput) {
  return useMemo(
    () =>
      buildProviderServicesViewModel({
        ownedServices,
        editingServiceId,
        newServicePricingMode,
        busyAction,
      }),
    [busyAction, editingServiceId, newServicePricingMode, ownedServices],
  );
}

export function buildProviderServicesViewModel({
  ownedServices,
  editingServiceId,
  newServicePricingMode,
  busyAction,
}: ProviderServicesViewModelInput) {
  const serviceRows = ownedServices.map((service) => ({
    service,
    id: service.id,
    title: service.title,
    metaLabel: `${service.price != null ? formatMoney(service.price) : 'No price'} · ${
      service.pricingMode ?? 'flat'
    }`,
    statusLabel: service.isActive ? 'active' : 'inactive',
    statusTone: service.isActive ? 'success' as const : 'neutral' as const,
    isEditing: editingServiceId === service.id,
    toggleButtonLabel:
      busyAction === `service-toggle-${service.id}`
        ? 'Updating...'
        : service.isActive
          ? 'Pause'
          : 'Activate',
    isToggleDisabled: busyAction === `service-toggle-${service.id}`,
    removeButtonLabel:
      busyAction === `service-remove-${service.id}` ? 'Removing...' : 'Remove',
    isRemoveDisabled: busyAction === `service-remove-${service.id}`,
  }));
  const pricingModeOptions: {
    value: BookingPricingMode;
    label: string;
    selected: boolean;
  }[] = [
    {
      value: 'flat',
      label: 'Flat rate',
      selected: newServicePricingMode === 'flat',
    },
    {
      value: 'hourly',
      label: 'Hourly rate',
      selected: newServicePricingMode === 'hourly',
    },
  ];

  return {
    data: {
      serviceRows,
      pricingModeOptions,
      hasServices: ownedServices.length > 0,
      saveEditButtonLabel: busyAction === 'service-edit' ? 'Saving...' : 'Save',
      isSaveEditDisabled: busyAction === 'service-edit',
      saveNewServiceButtonLabel:
        busyAction === 'service-add' ? 'Saving...' : 'Save Service',
      isSaveNewServiceDisabled: busyAction === 'service-add',
    },
    isLoading: false,
    error: null,
  };
}
