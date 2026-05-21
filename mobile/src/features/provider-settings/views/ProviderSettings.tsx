import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BriefcaseBusiness } from 'lucide-react-native';
import { Field, PrimaryButton, TopBar } from '../../../components/DesignKit';
import {
  SettingsRow,
  SettingsSection,
} from '../../../components/AppDisplay';
import { CurrentUserProfile } from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderSettingsViewModel } from '../viewModels/useProviderSettingsViewModel';

type ProviderSettingsScreenProps = {
  profile: CurrentUserProfile | null;
  deleteConfirmText: string;
  busyAction: string | null;
  canConfirmAccountDeletion: boolean;
  supportPanel: ReactNode;
  onBack: () => void;
  setDeleteConfirmText: (value: string) => void;
  signOut: () => void;
  deleteMyAccount: () => Promise<void>;
};

export function ProviderSettingsScreen({
  profile,
  deleteConfirmText,
  busyAction,
  canConfirmAccountDeletion,
  supportPanel,
  onBack,
  setDeleteConfirmText,
  signOut,
  deleteMyAccount,
}: ProviderSettingsScreenProps) {
  const settings = useProviderSettingsViewModel({
    profile,
    busyAction,
    canConfirmAccountDeletion,
  });

  return (
    <>
      <TopBar title="Settings" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>

          <SettingsSection title="Account">
            <SettingsRow
              icon={BriefcaseBusiness}
              label={settings.data.accountLabel}
              value={settings.data.accountValue}
            />
          </SettingsSection>

          {supportPanel}

          <PrimaryButton
            label="Sign out"
            variant="secondary"
            onPress={signOut}
          />

          <SettingsSection title="Danger Zone">
            <View style={styles.dangerPanel}>
              <Text style={styles.dangerHint}>
                Type{' '}
                <Text style={styles.dangerEmail}>
                  {profile?.user.email ?? 'your email'}
                </Text>{' '}
                to confirm account deletion.
              </Text>
              <Field
                label="Confirm email"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={settings.data.deletePlaceholder}
                keyboardType="email-address"
              />
              <PrimaryButton
                label={settings.data.deleteButtonLabel}
                variant="danger"
                onPress={() => void deleteMyAccount()}
                disabled={settings.data.isDeleting || !settings.data.canConfirmAccountDeletion}
              />
            </View>
          </SettingsSection>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  dangerPanel: {
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
