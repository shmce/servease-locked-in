import { useMemo } from 'react';
import { AppScreen } from '../../../navigation/types';

type ProviderMoreAction = {
  label: string;
  screen: AppScreen;
};

const actionRows: ProviderMoreAction[][] = [
  [
    { label: 'Profile', screen: 'providerProfileView' },
    { label: 'Portfolio', screen: 'providerPortfolio' },
  ],
  [
    { label: 'Services', screen: 'providerServices' },
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

export function useProviderMoreViewModel() {
  const data = useMemo(
    () => ({
      actionRows,
    }),
    [],
  );

  return {
    data,
    isLoading: false,
    error: null,
  };
}
