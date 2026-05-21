export interface UserPreferenceSummary {
  userId: string;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: string;
  notificationPreferences: Record<string, unknown>;
  updatedAt: string | null;
}

export interface UpdateUserPreferencesInput {
  pushNotificationsEnabled?: boolean | null;
  darkModeEnabled?: boolean | null;
  language?: string | null;
  notificationPreferences?: Record<string, unknown> | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function getUserPreferences(
  accessToken: string,
): Promise<UserPreferenceSummary> {
  return fetchPreferenceApi<UserPreferenceSummary>('/api/me/preferences', {
    accessToken,
  });
}

export function updateUserPreferences(
  accessToken: string,
  input: UpdateUserPreferencesInput,
): Promise<UserPreferenceSummary> {
  return fetchPreferenceApi<UserPreferenceSummary>('/api/me/preferences', {
    accessToken,
    method: 'PUT',
    body: input,
  });
}

async function fetchPreferenceApi<T>(
  path: string,
  options: {
    accessToken: string;
    method?: 'GET' | 'PUT';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach the preferences service.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Preferences request failed.');
  }

  return payload.data;
}
