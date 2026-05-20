import { useMemo } from 'react';
import { CurrentUserProfile } from '../../../shared/models/types';

export function useProviderSettingsViewModel({
  profile,
  busyAction,
  canConfirmAccountDeletion,
}: {
  profile: CurrentUserProfile | null;
  busyAction: string | null;
  canConfirmAccountDeletion: boolean;
}) {
  const data = useMemo(
    () => ({
      pageTitle: 'Settings',
      pageSubtitle: 'Account access and danger zone',
      accountLabel: profile?.providerProfile?.businessName ?? 'Provider account',
      accountValue: profile?.user.email ?? 'Email unavailable',
      deletePrompt: `Type ${profile?.user.email ?? 'your email'} to enable account deletion.`,
      deletePlaceholder: profile?.user.email ?? 'email@example.com',
      deleteButtonLabel: busyAction === 'delete-account' ? 'Deleting...' : 'Delete Account',
      canConfirmAccountDeletion,
      isDeleting: busyAction === 'delete-account',
    }),
    [busyAction, canConfirmAccountDeletion, profile],
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
