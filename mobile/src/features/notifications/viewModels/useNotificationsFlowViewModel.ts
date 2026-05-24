import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readError } from '../../../navigation/routeHelpers';
import type { AppRole } from '../../../navigation/types';
import {
  listNotifications,
  markNotificationRead,
} from '../../../shared/models/apiService';
import type {
  ApiOptions,
  NotificationSummary,
} from '../../../shared/models/types';
import { isInternalTestNotification } from '../../../shared/utils/notifications';

type NotificationPayloadInput = {
  type?: string | null;
  metadata?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
};

type NotificationsFlowViewModelInput = {
  apiOptions: ApiOptions;
  appRole: AppRole;
  hasSession: boolean;
  onRouteFromPayload: (input: NotificationPayloadInput) => void;
  setBusyAction: (busyAction: string | null) => void;
  setNotice: (notice: string) => void;
};

export function useNotificationsFlowViewModel({
  apiOptions,
  appRole,
  hasSession,
  onRouteFromPayload,
  setBusyAction,
  setNotice,
}: NotificationsFlowViewModelInput) {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const handledPushNotificationIds = useRef<Set<string>>(new Set());
  const refreshFailureNotified = useRef(false);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !isInternalTestNotification(notification),
      ),
    [notifications],
  );
  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const markRead = useCallback(
    async (notificationId: string) => {
      setBusyAction(`notification-${notificationId}`);
      try {
        const notification = await markNotificationRead(notificationId, apiOptions);
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? notification : item)),
        );
        setNotice('Notification marked read.');
      } catch (error) {
        setNotice(readError(error));
      } finally {
        setBusyAction(null);
      }
    },
    [apiOptions, setBusyAction, setNotice],
  );

  const refreshNotifications = useCallback(async () => {
    try {
      setNotifications(await listNotifications(apiOptions));
      refreshFailureNotified.current = false;
    } catch (error) {
      if (!refreshFailureNotified.current) {
        setNotice(`Notifications could not be refreshed: ${readError(error)}`);
        refreshFailureNotified.current = true;
      }
    }
  }, [apiOptions, setNotice]);

  const openNotification = useCallback(
    async (notification: NotificationSummary) => {
      if (!notification.isRead) {
        void markRead(notification.id);
      }
      onRouteFromPayload({
        type: notification.type,
        metadata: metadataRecord(notification.metadata),
      });
    },
    [markRead, onRouteFromPayload],
  );

  useEffect(() => {
    if (!hasSession || !appRole) {
      return undefined;
    }

    let isMounted = true;
    const subscriptions: { remove: () => void }[] = [];

    const handleResponse = (response: unknown) => {
      const data =
        (response as {
          notification?: {
            request?: {
              content?: {
                data?: Record<string, unknown>;
              };
            };
          };
        })?.notification?.request?.content?.data ?? {};
      const notificationId =
        typeof data.notificationId === 'string' ? data.notificationId : null;

      if (
        notificationId &&
        handledPushNotificationIds.current.has(notificationId)
      ) {
        return;
      }
      if (notificationId) {
        handledPushNotificationIds.current.add(notificationId);
        void markRead(notificationId);
      }

      onRouteFromPayload({ data });
    };

    void import('expo-notifications')
      .then(async (expoNotifications) => {
        if (!isMounted) {
          return;
        }
        expoNotifications.setNotificationHandler?.({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: true,
          }),
        });

        subscriptions.push(
          expoNotifications.addNotificationResponseReceivedListener(handleResponse),
        );
        if (expoNotifications.addNotificationReceivedListener) {
          subscriptions.push(
            expoNotifications.addNotificationReceivedListener(() => {
              void refreshNotifications();
            }),
          );
        }

        const initialResponse =
          expoNotifications.getLastNotificationResponse?.() ??
          (await expoNotifications.getLastNotificationResponseAsync?.());
        if (initialResponse && isMounted) {
          handleResponse(initialResponse);
          expoNotifications.clearLastNotificationResponse?.();
        }
      })
      .catch(() => {
        // Notification listeners are best-effort on unsupported runtimes.
      });

    return () => {
      isMounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [appRole, hasSession, markRead, onRouteFromPayload, refreshNotifications]);

  return {
    data: {
      notifications,
      unreadCount,
      visibleNotifications,
    },
    actions: {
      clear: () => setNotifications([]),
      markRead,
      openNotification,
      refreshNotifications,
      replaceNotifications: setNotifications,
    },
    isLoading: false,
    error: null,
  };
}

function metadataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
}
