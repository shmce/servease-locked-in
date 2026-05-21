import { useMemo } from 'react';
import {
  CurrentUserSessionSummary,
  UserPreferenceSummary,
} from '../../../shared/models/types';

export type CustomerSettingsIcon =
  | 'bell'
  | 'calendar'
  | 'credit-card'
  | 'message-circle'
  | 'gift'
  | 'globe'
  | 'moon';

export type CustomerSettingsPreferencePatch = {
  pushNotificationsEnabled?: boolean;
  darkModeEnabled?: boolean;
  language?: 'en' | 'fil';
  notificationPreferences?: Record<string, unknown>;
};

export type CustomerSettingsViewModelInput = {
  userPreferences: UserPreferenceSummary | null;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  activeSessions: CurrentUserSessionSummary[];
  profileEmail?: string | null;
  deleteConfirmText: string;
  savePreferences: (patch: CustomerSettingsPreferencePatch) => void | Promise<void>;
};

const notificationCategories = [
  { category: 'booking_updates', icon: 'calendar', label: 'Booking updates' },
  { category: 'payment_alerts', icon: 'credit-card', label: 'Payment alerts' },
  { category: 'messages', icon: 'message-circle', label: 'Messages' },
  { category: 'promotions', icon: 'gift', label: 'Promotions and offers' },
] as const;

export function useCustomerSettingsViewModel({
  userPreferences,
  pushNotificationsEnabled,
  darkModeEnabled,
  activeSessions,
  profileEmail,
  deleteConfirmText,
  savePreferences,
}: CustomerSettingsViewModelInput) {
  return useMemo(() => {
    function getNotificationCategoryEnabled(category: string): boolean {
      const prefs = userPreferences?.notificationPreferences;
      if (!prefs || typeof prefs !== 'object') {
        return true;
      }
      const value = (prefs as Record<string, unknown>)[category];
      if (typeof value === 'boolean') {
        return value;
      }
      return true;
    }

    async function toggleNotificationCategory(category: string) {
      const current =
        (userPreferences?.notificationPreferences as
          | Record<string, unknown>
          | undefined) ?? {};
      await savePreferences({
        notificationPreferences: {
          ...current,
          [category]: !getNotificationCategoryEnabled(category),
        },
      });
    }

    const notificationRows = notificationCategories.map((item) => ({
      ...item,
      icon: item.icon as CustomerSettingsIcon,
      toggleValue: getNotificationCategoryEnabled(item.category),
      onToggle: () => toggleNotificationCategory(item.category),
    }));
    const activeSessionRows = activeSessions.map((session) => ({
      id: session.id,
      emailLabel: session.email || 'This device',
      lastSignInLabel: session.lastSignInAt
        ? `Last sign-in ${new Date(session.lastSignInAt).toLocaleString()}`
        : 'Never signed in',
    }));
    const language = userPreferences?.language ?? 'en';

    return {
      data: {
        notificationRows,
        pushNotificationsEnabled,
        darkModeEnabled,
        language,
        languageLabel: language === 'fil' ? 'Filipino' : 'English',
        nextLanguage: language === 'fil' ? 'en' : 'fil',
        activeSessionRows,
        twoFactor: null,
        profileEmail: profileEmail ?? null,
        canConfirmAccountDeletion:
          Boolean(profileEmail) && deleteConfirmText.trim() === profileEmail,
      },
      isLoading: false,
      error: null,
      actions: {
        togglePushNotifications: () =>
          savePreferences({
            pushNotificationsEnabled: !pushNotificationsEnabled,
          }),
        toggleDarkMode: () =>
          savePreferences({
            darkModeEnabled: !darkModeEnabled,
          }),
        toggleLanguage: () =>
          savePreferences({
            language: language === 'fil' ? 'en' : 'fil',
          }),
      },
    };
  }, [
    activeSessions,
    darkModeEnabled,
    deleteConfirmText,
    profileEmail,
    pushNotificationsEnabled,
    savePreferences,
    userPreferences,
  ]);
}
