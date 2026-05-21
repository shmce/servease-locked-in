import { useMemo } from 'react';
import { AppScreen } from '../../../navigation/types';
import { CurrentUserProfile } from '../../../shared/models/types';

export type CustomerMoreMenuItem = {
  label: string;
  screen: AppScreen;
  badge?: number;
};

const baseMenuItems: Omit<CustomerMoreMenuItem, 'badge'>[] = [
  { label: 'My Profile', screen: 'customerProfile' },
  { label: 'Notifications', screen: 'customerNotifications' },
  { label: 'Refer a Friend', screen: 'customerReferral' },
  { label: 'Payment Methods', screen: 'customerPaymentMethods' },
  { label: 'Security', screen: 'customerSecurity' },
  { label: 'Settings', screen: 'customerSettings' },
  { label: 'Help & Support', screen: 'customerHelp' },
  { label: 'Terms & Privacy', screen: 'customerTerms' },
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

    const menuItems: CustomerMoreMenuItem[] = baseMenuItems.map((item) =>
      item.screen === 'customerNotifications' && unreadNotificationCount > 0
        ? { ...item, badge: unreadNotificationCount }
        : item,
    );

    const actionRows: CustomerMoreMenuItem[][] = [];
    for (let i = 0; i < menuItems.length; i += 2) {
      actionRows.push(menuItems.slice(i, i + 2));
    }

    return {
      data: {
        displayName,
        displayEmail,
        initial: displayName.slice(0, 1).toUpperCase(),
        actionRows,
        unreadNotificationCount,
      },
      isLoading: false,
      error: null,
    };
  }, [profile, unreadNotificationCount]);
}
