import { useMemo } from 'react';
import { CurrentUserProfile } from '../../../shared/models/types';

export function useCustomerProfileViewModel({
  profile,
  customerAvatarUri,
  busyAction,
}: {
  profile: CurrentUserProfile | null;
  customerAvatarUri: string | null;
  busyAction: string | null;
}) {
  const data = useMemo(() => {
    const displaySource = profile?.user.fullName ?? profile?.user.email ?? 'C';
    const persistedAvatarUri = profile?.user.avatarUrl ?? null;
    const avatarUri = customerAvatarUri ?? persistedAvatarUri;
    const isUploadingAvatar = busyAction === 'upload-avatar';

    return {
      avatarUri,
      avatarInitial: displaySource.slice(0, 1).toUpperCase(),
      avatarDisabled: isUploadingAvatar,
      avatarHint: isUploadingAvatar
        ? 'Uploading profile photo...'
        : customerAvatarUri
          ? 'Uploaded photo ready to save'
          : persistedAvatarUri
            ? 'Saved to your account'
            : 'Add a profile photo',
      emailLabel: profile?.user.email ?? 'Not signed in',
      saveLabel: busyAction === 'profile-update' ? 'Saving...' : 'Save Changes',
    };
  }, [busyAction, customerAvatarUri, profile]);

  return {
    data,
    isLoading: false,
    isSaving: busyAction === 'profile-update',
    error: null,
  };
}
