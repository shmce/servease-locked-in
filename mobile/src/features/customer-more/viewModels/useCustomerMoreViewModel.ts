import { useMemo } from 'react';
import { AppScreen } from '../../../navigation/types';
import { CurrentUserProfile } from '../../../shared/models/types';

export type CustomerMoreMenuIcon =
  | 'user'
  | 'bell'
  | 'gift'
  | 'wallet'
  | 'settings'
  | 'help'
  | 'file';

export type CustomerMoreMenuItem = {
  label: string;
  icon: CustomerMoreMenuIcon;
  screen: AppScreen;
};

const menuItems: CustomerMoreMenuItem[] = [
  { label: 'My Profile', icon: 'user', screen: 'customerProfile' },
  { label: 'Notifications', icon: 'bell', screen: 'customerNotifications' },
  { label: 'Refer a Friend', icon: 'gift', screen: 'customerReferral' },
  { label: 'Payment Methods', icon: 'wallet', screen: 'customerPaymentMethods' },
  { label: 'Settings', icon: 'settings', screen: 'customerSettings' },
  { label: 'Help & Support', icon: 'help', screen: 'customerHelp' },
  { label: 'Terms & Privacy', icon: 'file', screen: 'customerTerms' },
];

export function useCustomerMoreViewModel({
  profile,
  unreadNotificationCount = 0,
}: {
  profile: CurrentUserProfile | null;
  unreadNotificationCount?: number;
}) {
  return useMemo(() => {
    const displayName = profile?.user.fullName ?? 'Customer';
    const displayEmail = profile?.user.email ?? 'customer@example.com';

    return {
      data: {
        displayName,
        displayEmail,
        menuItems,
        unreadNotificationCount,
      },
      isLoading: false,
      error: null,
    };
  }, [profile, unreadNotificationCount]);
}
