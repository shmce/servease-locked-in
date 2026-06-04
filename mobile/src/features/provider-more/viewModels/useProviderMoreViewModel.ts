import { useMemo } from 'react';
import { AppScreen } from '../../../navigation/types';
import { CurrentUserProfile } from '../../../shared/models/types';

type ProviderMoreAction = {
  label: string;
  screen: AppScreen;
  badge?: number;
};

const actionRows: ProviderMoreAction[][] = [
  [
    { label: 'Profile', screen: 'providerProfileView' },
    { label: 'Portfolio', screen: 'providerPortfolio' },
  ],
  [
    { label: 'Services', screen: 'providerServices' },
    { label: 'Application', screen: 'providerApplicationDocuments' },
    { label: 'Availability', screen: 'calendar' },
  ],
  [
    { label: 'Payouts', screen: 'providerPayoutManagement' },
    { label: 'Request Payout', screen: 'providerRequestPayout' },
  ],
  [
    { label: 'Insights', screen: 'providerInsights' },
    { label: 'Notifications', screen: 'providerNotifications' },
  ],
  [
    { label: 'Help Center', screen: 'providerHelp' },
    { label: 'Security', screen: 'providerSecurity' },
  ],
  [{ label: 'Settings', screen: 'providerSettings' }],
];

export function useProviderMoreViewModel({
  profile,
  unreadNotificationCount = 0,
}: {
  profile: CurrentUserProfile | null;
  unreadNotificationCount?: number;
}) {
  const data = useMemo(
    () => {
      const displayName =
        profile?.providerProfile?.businessName ??
        profile?.user.fullName ??
        'Provider';
      const displayEmail = profile?.user.email ?? 'provider@example.com';
      const rows = actionRows.map((row) =>
        row.map((action) =>
          action.screen === 'providerNotifications' && unreadNotificationCount > 0
            ? { ...action, badge: unreadNotificationCount }
            : action,
        ),
      );

      return {
        actionRows: rows,
        avatarUri: profile?.user.avatarUrl ?? null,
        displayEmail,
        displayName,
        initial: displayName.slice(0, 1).toUpperCase(),
        unreadNotificationCount,
      };
    },
    [profile, unreadNotificationCount],
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
