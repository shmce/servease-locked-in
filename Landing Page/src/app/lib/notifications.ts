export interface NotificationSummary {
  id: string;
  userId: string;
  type: string;
  title: string | null;
  body: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function listNotifications(
  accessToken: string,
): Promise<NotificationSummary[]> {
  return fetchNotificationApi<NotificationSummary[]>('/api/notifications', {
    accessToken,
    method: 'GET',
  });
}

export function markNotificationRead(
  accessToken: string,
  notificationId: string,
): Promise<NotificationSummary> {
  return fetchNotificationApi<NotificationSummary>(
    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      accessToken,
      method: 'PATCH',
    },
  );
}

async function fetchNotificationApi<T>(
  path: string,
  options: {
    accessToken: string;
    method: 'GET' | 'PATCH';
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method,
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
    },
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach notifications. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Notification request failed.');
  }

  return payload.data;
}
