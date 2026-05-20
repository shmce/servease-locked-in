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

    return {
      avatarUri: customerAvatarUri,
      avatarInitial: displaySource.slice(0, 1).toUpperCase(),
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
