import { StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  Calendar,
  CreditCard,
  Gift,
  Globe,
  Lock,
  MessageCircle,
  Moon,
} from 'lucide-react-native';
import {
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  SettingsRow,
  SettingsSection,
} from '../../../components/AppDisplay';
import {
  CurrentUserSessionSummary,
  UserPreferenceSummary,
} from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  CustomerSettingsIcon,
  CustomerSettingsPreferencePatch,
  useCustomerSettingsViewModel,
} from '../viewModels/useCustomerSettingsViewModel';

type CustomerSettingsScreenProps = {
  userPreferences: UserPreferenceSummary | null;
  pushNotificationsEnabled: boolean;
  darkModeEnabled: boolean;
  activeSessions: CurrentUserSessionSummary[];
  profileEmail?: string | null;
  currentPassword: string;
  newPassword: string;
  deleteConfirmText: string;
  busyAction: string | null;
  onBack: () => void;
  setNotice: (notice: string) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setDeleteConfirmText: (value: string) => void;
  savePreferences: (patch: CustomerSettingsPreferencePatch) => void | Promise<void>;
  savePassword: () => void | Promise<void>;
  deleteMyAccount: () => void | Promise<void>;
};

const settingsIcons: Record<CustomerSettingsIcon, typeof Bell> = {
  bell: Bell,
  calendar: Calendar,
  'credit-card': CreditCard,
  'message-circle': MessageCircle,
  gift: Gift,
  globe: Globe,
  moon: Moon,
};

export function CustomerSettingsScreen({
  userPreferences,
  pushNotificationsEnabled,
  darkModeEnabled,
  activeSessions,
  profileEmail,
  currentPassword,
  newPassword,
  deleteConfirmText,
  busyAction,
  onBack,
  setNotice,
  setCurrentPassword,
  setNewPassword,
  setDeleteConfirmText,
  savePreferences,
  savePassword,
  deleteMyAccount,
}: CustomerSettingsScreenProps) {
  const settings = useCustomerSettingsViewModel({
    userPreferences,
    pushNotificationsEnabled,
    darkModeEnabled,
    activeSessions,
    profileEmail,
    deleteConfirmText,
    savePreferences,
  });
  const { data, actions } = settings;

  return (
    <>
      <TopBar title="Settings" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>

          <SettingsSection title="Notifications">
            <SettingsRow
              icon={Bell}
              label="Push Notifications"
              toggleValue={data.pushNotificationsEnabled}
              onToggle={() => void actions.togglePushNotifications()}
            />
            {data.notificationRows.map((row) => {
              const Icon = settingsIcons[row.icon];
              return (
                <SettingsRow
                  key={row.category}
                  icon={Icon}
                  label={row.label}
                  toggleValue={row.toggleValue}
                  onToggle={() => void row.onToggle()}
                />
              );
            })}
          </SettingsSection>

          <SettingsSection title="Security">
            {/* TwoFactorSettingsCard is rendered by the dedicated Security screen. */}
            <SettingsRow
              icon={Lock}
              label="Change Password"
              onPress={() => setNotice('Enter your current and new password below.')}
            />
            <View style={styles.settingsPanel}>
              <Field
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Current password"
              />
              <Field
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="New password"
              />
              <PrimaryButton
                label={busyAction === 'password-change' ? 'Saving...' : 'Save Password'}
                onPress={() => void savePassword()}
                disabled={busyAction === 'password-change'}
              />
            </View>
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsRow
              icon={Globe}
              label="Language"
              value={data.languageLabel}
              onPress={() => void actions.toggleLanguage()}
            />
            <SettingsRow
              icon={Moon}
              label="Dark Mode"
              toggleValue={data.darkModeEnabled}
              onToggle={() => void actions.toggleDarkMode()}
            />
          </SettingsSection>

          <SettingsSection title="Active Sessions">
            {data.activeSessionRows.length === 0 ? (
              <SettingsRow icon={Lock} label="No active sessions detected." />
            ) : (
              data.activeSessionRows.map((session) => (
                <SettingsRow
                  key={session.id}
                  icon={Lock}
                  label={session.emailLabel}
                  value={session.lastSignInLabel}
                />
              ))
            )}
          </SettingsSection>

          <SettingsSection title="Danger Zone">
            <View style={styles.settingsPanel}>
              <Text style={styles.dangerHint}>
                Type <Text style={styles.dangerEmail}>{data.profileEmail ?? 'your email'}</Text> to
                confirm account deletion.
              </Text>
              <Field
                label="Confirm email"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={data.profileEmail ?? 'email@example.com'}
                keyboardType="email-address"
              />
              <PrimaryButton
                label={busyAction === 'delete-account' ? 'Deleting...' : 'Delete My Account'}
                variant="danger"
                onPress={() => void deleteMyAccount()}
                disabled={busyAction === 'delete-account' || !data.canConfirmAccountDeletion}
              />
            </View>
          </SettingsSection>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  settingsPanel: {
    gap: spacing.md,
  },
  dangerHint: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
  },
  dangerEmail: {
    color: palette.ink,
    fontWeight: '700',
  },
});
