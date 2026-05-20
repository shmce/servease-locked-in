import { useMemo } from 'react';
import { CurrentUserProfile } from '../../../shared/models/types';

type ProviderEditProfileViewModelInput = {
  profile: CurrentUserProfile | null;
  busyAction: string | null;
};

export function useProviderEditProfileViewModel({
  profile,
  busyAction,
}: ProviderEditProfileViewModelInput) {
  return useMemo(
    () => buildProviderEditProfileViewModel({ profile, busyAction }),
    [busyAction, profile],
  );
}

export function buildProviderEditProfileViewModel({
  profile,
  busyAction,
}: ProviderEditProfileViewModelInput) {
  const isSaving = busyAction === 'profile-update';

  return {
    data: {
      saveButtonLabel: isSaving ? 'Saving...' : 'Save Profile',
      canSave: Boolean(profile) && !isSaving,
      notice:
        'Service area and service descriptions are managed from provider services.',
    },
    isLoading: false,
    error: null,
  };
}
