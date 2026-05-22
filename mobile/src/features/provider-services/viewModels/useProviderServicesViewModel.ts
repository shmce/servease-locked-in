import { useMemo } from 'react';
import type {
  BookingPricingMode,
  ProviderOwnedServiceSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

type ProviderVerificationStatus = 'pending' | 'approved' | 'rejected';

type ProviderServicesViewModelInput = {
  ownedServices: ProviderOwnedServiceSummary[];
  editingServiceId: string | null;
  newServicePricingMode: BookingPricingMode;
  busyAction: string | null;
  providerVerificationStatus?: ProviderVerificationStatus | null;
};

export function useProviderServicesViewModel({
  ownedServices,
  editingServiceId,
  newServicePricingMode,
  busyAction,
  providerVerificationStatus,
}: ProviderServicesViewModelInput) {
  return useMemo(
    () =>
      buildProviderServicesViewModel({
        ownedServices,
        editingServiceId,
        newServicePricingMode,
        busyAction,
        providerVerificationStatus,
      }),
    [
      busyAction,
      editingServiceId,
      newServicePricingMode,
      ownedServices,
      providerVerificationStatus,
    ],
  );
}

export function buildProviderServicesViewModel({
  ownedServices,
  editingServiceId,
  newServicePricingMode,
  busyAction,
  providerVerificationStatus,
}: ProviderServicesViewModelInput) {
  const canManageServices = providerVerificationStatus === 'approved';
  const isServiceManagementLocked = !canManageServices;
  const serviceRows = ownedServices.map((service) => ({
    service,
    id: service.id,
    title: service.title,
    metaLabel: `${service.price != null ? formatMoney(service.price) : 'No price'} · ${
      service.pricingMode ?? 'flat'
    }`,
    statusLabel: service.isActive ? 'active' : 'inactive',
    statusTone: service.isActive ? 'success' as const : 'neutral' as const,
    isEditing: canManageServices && editingServiceId === service.id,
    canEdit: canManageServices,
    toggleButtonLabel:
      busyAction === `service-toggle-${service.id}`
        ? 'Updating...'
        : service.isActive
          ? 'Pause'
          : 'Activate',
    isToggleDisabled:
      isServiceManagementLocked || busyAction === `service-toggle-${service.id}`,
    removeButtonLabel:
      busyAction === `service-remove-${service.id}` ? 'Removing...' : 'Remove',
    isRemoveDisabled:
      isServiceManagementLocked || busyAction === `service-remove-${service.id}`,
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
      canManageServices,
      isServiceManagementLocked,
      lockedTitle: 'Application approval required',
      lockedBody:
        'Upload your government ID and required records, then wait for admin approval before creating services.',
      saveEditButtonLabel: busyAction === 'service-edit' ? 'Saving...' : 'Save',
      isSaveEditDisabled: isServiceManagementLocked || busyAction === 'service-edit',
      saveNewServiceButtonLabel:
        busyAction === 'service-add' ? 'Saving...' : 'Save Service',
      isSaveNewServiceDisabled:
        isServiceManagementLocked || busyAction === 'service-add',
    },
    isLoading: false,
    error: null,
  };
}
