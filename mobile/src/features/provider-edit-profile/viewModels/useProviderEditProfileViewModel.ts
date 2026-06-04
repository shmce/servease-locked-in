import { useMemo } from 'react';
import { CurrentUserProfile } from '../../../shared/models/types';

type ProviderEditProfileViewModelInput = {
  profile: CurrentUserProfile | null;
  profileAvatarUri?: string | null;
  busyAction: string | null;
};

export function useProviderEditProfileViewModel({
  profile,
  profileAvatarUri,
  busyAction,
}: ProviderEditProfileViewModelInput) {
  return useMemo(
    () => buildProviderEditProfileViewModel({ profile, profileAvatarUri, busyAction }),
    [busyAction, profile, profileAvatarUri],
  );
}

export function buildProviderEditProfileViewModel({
  profile,
  profileAvatarUri,
  busyAction,
}: ProviderEditProfileViewModelInput) {
  const isSaving = busyAction === 'profile-update';
  const isUploadingAvatar = busyAction === 'upload-avatar';
  const displaySource = profile?.user.fullName ?? profile?.user.email ?? 'P';
  const persistedAvatarUri = profile?.user.avatarUrl ?? null;

  return {
    data: {
      avatarUri: profileAvatarUri ?? persistedAvatarUri,
      avatarInitial: displaySource.slice(0, 1).toUpperCase(),
      avatarDisabled: isUploadingAvatar,
      avatarHint: isUploadingAvatar
        ? 'Uploading profile photo...'
        : profileAvatarUri
          ? 'Uploaded photo ready to save'
          : persistedAvatarUri
            ? 'Saved to your account'
            : 'Add a profile photo',
      saveButtonLabel: isSaving ? 'Saving...' : 'Save Profile',
      canSave: Boolean(profile) && !isSaving,
      notice:
        'Service area and service descriptions are managed from provider services.',
    },
    isLoading: false,
    error: null,
  };
}
