import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import {
  CurrentUserSessionSummary,
  UserPreferenceSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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

function ToggleIndicator({ value }: { value: boolean }) {
  return (
    <View style={[styles.toggleTrack, value && styles.toggleTrackActive]}>
      <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
    </View>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  value,
  toggleValue,
  onToggle,
  onPress,
  danger,
}: {
  icon: typeof Bell;
  label: string;
  value?: string | null;
  toggleValue?: boolean;
  onToggle?: () => void | Promise<void>;
  onPress?: () => void | Promise<void>;
  danger?: boolean;
}) {
  const handler = onToggle ?? onPress;
  const content = (
    <View style={styles.settingRow}>
      <CustomerIconBlock compact>
        <Icon
          color={danger ? palette.red : palette.mintDeep}
          size={18}
          strokeWidth={2.1}
        />
      </CustomerIconBlock>
      <View style={styles.flex}>
        <Text
          style={[styles.settingLabel, danger && styles.settingLabelDanger]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {value ? (
          <Text style={styles.settingValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {typeof toggleValue === 'boolean' ? (
        <ToggleIndicator value={toggleValue} />
      ) : null}
    </View>
  );

  if (!handler) {
    return content;
  }

  return (
    <Pressable
      onPress={() => void handler()}
      accessibilityRole="button"
      accessibilityState={
        typeof toggleValue === 'boolean' ? { checked: toggleValue } : undefined
      }
    >
      {content}
    </Pressable>
  );
}

function SettingsInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={styles.settingsField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A7AFB8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Settings"
          subtitle="Manage notifications, preferences, and account access"
          onBack={onBack}
        />

        <CustomerSection title="Notifications">
          <CustomerCard style={styles.settingsList}>
            <SettingsItem
              icon={Bell}
              label="Push notifications"
              toggleValue={data.pushNotificationsEnabled}
              onToggle={actions.togglePushNotifications}
            />
            {data.notificationRows.map((row) => {
              const Icon = settingsIcons[row.icon];
              return (
                <SettingsItem
                  key={row.category}
                  icon={Icon}
                  label={row.label}
                  toggleValue={row.toggleValue}
                  onToggle={row.onToggle}
                />
              );
            })}
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Security">
          {/* TwoFactorSettingsCard is rendered by the dedicated Security screen. */}
          <CustomerCard style={styles.settingsList}>
            <SettingsItem
              icon={Lock}
              label="Change password"
              value="Edit below"
              onPress={() => setNotice('Enter your current and new password below.')}
            />
          </CustomerCard>
          <CustomerCard style={styles.formCard}>
            <SettingsInput
              label="Current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Current password"
            />
            <SettingsInput
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="New password"
            />
            <Pressable
              style={[
                styles.secondaryButton,
                busyAction === 'password-change' && styles.buttonDisabled,
              ]}
              onPress={() => void savePassword()}
              disabled={busyAction === 'password-change'}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                {busyAction === 'password-change' ? 'Saving...' : 'Save Password'}
              </Text>
            </Pressable>
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Preferences">
          <CustomerCard style={styles.settingsList}>
            <SettingsItem
              icon={Globe}
              label="Language"
              value={data.languageLabel}
              onPress={actions.toggleLanguage}
            />
            <SettingsItem
              icon={Moon}
              label="Dark mode"
              toggleValue={data.darkModeEnabled}
              onToggle={actions.toggleDarkMode}
            />
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Active sessions">
          <CustomerCard style={styles.settingsList}>
            {data.activeSessionRows.length === 0 ? (
              <SettingsItem icon={Lock} label="No active sessions detected." />
            ) : (
              data.activeSessionRows.map((session) => (
                <SettingsItem
                  key={session.id}
                  icon={Lock}
                  label={session.emailLabel}
                  value={session.lastSignInLabel}
                />
              ))
            )}
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Danger zone">
          <CustomerCard style={styles.formCard}>
            <Text style={styles.dangerHint}>
              Type <Text style={styles.dangerEmail}>{data.profileEmail ?? 'your email'}</Text> to
              confirm account deletion.
            </Text>
            <SettingsInput
              label="Confirm email"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={data.profileEmail ?? 'email@example.com'}
              keyboardType="email-address"
            />
            <Pressable
              style={[
                styles.dangerButton,
                (busyAction === 'delete-account' || !data.canConfirmAccountDeletion) &&
                  styles.buttonDisabled,
              ]}
              onPress={() => void deleteMyAccount()}
              disabled={
                busyAction === 'delete-account' || !data.canConfirmAccountDeletion
              }
              accessibilityRole="button"
            >
              <Text style={styles.dangerButtonText}>
                {busyAction === 'delete-account' ? 'Deleting...' : 'Delete My Account'}
              </Text>
            </Pressable>
          </CustomerCard>
        </CustomerSection>
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  settingsList: {
    gap: 0,
    paddingVertical: 0,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    ...customerText.title,
    fontSize: 14,
    lineHeight: 19,
  },
  settingLabelDanger: {
    color: palette.red,
  },
  settingValue: {
    ...customerText.meta,
    marginTop: 2,
  },
  toggleTrack: {
    backgroundColor: '#E5E8EB',
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 48,
  },
  toggleTrackActive: {
    backgroundColor: '#DDF5E8',
  },
  toggleKnob: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 22,
    width: 22,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: palette.mintDeep,
  },
  formCard: {
    gap: spacing.md,
  },
  settingsField: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...customerText.meta,
    color: '#7A828D',
  },
  input: {
    ...customerText.body,
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  dangerHint: {
    ...customerText.body,
  },
  dangerEmail: {
    color: '#202733',
    fontWeight: '600',
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#FEECEC',
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  dangerButtonText: {
    color: '#C2413D',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
});
