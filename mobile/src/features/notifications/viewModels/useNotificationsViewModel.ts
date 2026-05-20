import { useMemo } from 'react';
import { NotificationSummary } from '../../../shared/models/types';
import { formatDateTime } from '../../../shared/utils/booking';
import { isInternalTestNotification } from '../../../shared/utils/notifications';

type NotificationIconKind = 'payment' | 'booking' | 'promo' | 'support' | 'default';

function notificationIconKind(type: string): NotificationIconKind {
  if (type.includes('payment')) {
    return 'payment';
  }
  if (type.includes('booking')) {
    return 'booking';
  }
  if (type.includes('promo')) {
    return 'promo';
  }
  if (type.includes('support')) {
    return 'support';
  }
  return 'default';
}

export function useNotificationsViewModel({
  notifications,
}: {
  notifications: NotificationSummary[];
}) {
  const data = useMemo(() => {
    const visibleNotifications = notifications
      .filter((notification) => !isInternalTestNotification(notification))
      .map((notification) => ({
        notification,
        title: notification.title ?? notification.type,
        body: notification.body ?? 'Notification update',
        createdAtLabel: formatDateTime(notification.createdAt),
        iconKind: notificationIconKind(notification.type),
        isUnread: !notification.isRead,
      }));
    const unreadCount = visibleNotifications.filter((notification) => notification.isUnread).length;

    return {
      visibleNotifications,
      unreadCount,
      isEmpty: visibleNotifications.length === 0,
    };
  }, [notifications]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
