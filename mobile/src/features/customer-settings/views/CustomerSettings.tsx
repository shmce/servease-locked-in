import { StyleSheet, Text } from 'react-native';
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
import { TwoFactorSettingsCard } from '../../../shared/components/TwoFactorSettingsCard';
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
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  twoFactorCode: string;
  deleteConfirmText: string;
  busyAction: string | null;
  onBack: () => void;
  setNotice: (notice: string) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setTwoFactorCode: (value: string) => void;
  setDeleteConfirmText: (value: string) => void;
  savePreferences: (patch: CustomerSettingsPreferencePatch) => void | Promise<void>;
  savePassword: () => void | Promise<void>;
  startTwoFactorSetup: () => void | Promise<void>;
  verifyTwoFactorSetup: () => void | Promise<void>;
  disableTwoFactorSetup: () => void | Promise<void>;
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
  twoFactorEnabled,
  twoFactorSecret,
  twoFactorCode,
  deleteConfirmText,
  busyAction,
  onBack,
  setNotice,
  setCurrentPassword,
  setNewPassword,
  setTwoFactorCode,
  setDeleteConfirmText,
  savePreferences,
  savePassword,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
  deleteMyAccount,
}: CustomerSettingsScreenProps) {
  const settings = useCustomerSettingsViewModel({
    userPreferences,
    pushNotificationsEnabled,
    darkModeEnabled,
    activeSessions,
    profileEmail,
    deleteConfirmText,
    twoFactorEnabled,
    twoFactorSecret,
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
            <SettingsRow
              icon={Lock}
              label="Change Password"
              onPress={() => setNotice('Enter your current and new password below.')}
            />
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
            <TwoFactorSettingsCard
              busyAction={busyAction}
              twoFactorCode={twoFactorCode}
              twoFactorEnabled={twoFactorEnabled}
              twoFactorSecret={twoFactorSecret}
              onCodeChange={setTwoFactorCode}
              startTwoFactorSetup={startTwoFactorSetup}
              verifyTwoFactorSetup={verifyTwoFactorSetup}
              disableTwoFactorSetup={disableTwoFactorSetup}
            />
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

          <SettingsSection title="Active sessions">
            {data.activeSessionRows.length === 0 ? (
              <SettingsRow icon={Lock} label="No active session detected." />
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
            <Text style={styles.cardMeta}>
              Type {data.profileEmail ?? 'your email'} to enable account deletion.
            </Text>
            <Field
              label="Confirm email"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={data.profileEmail ?? 'email@example.com'}
              keyboardType="email-address"
            />
            <PrimaryButton
              label={busyAction === 'delete-account' ? 'Deleting...' : 'Delete Account'}
              variant="danger"
              onPress={() => void deleteMyAccount()}
              disabled={busyAction === 'delete-account' || !data.canConfirmAccountDeletion}
            />
          </SettingsSection>
        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  monoText: {
    fontFamily: 'monospace',
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
