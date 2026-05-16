export interface UserPreferenceSummary {
  userId: string;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: string;
  notificationPreferences: Record<string, unknown>;
  updatedAt: string | null;
}

export interface UpdateUserPreferencesRequest {
  pushNotificationsEnabled?: boolean | null;
  darkModeEnabled?: boolean | null;
  language?: string | null;
  notificationPreferences?: Record<string, unknown> | null;
}
