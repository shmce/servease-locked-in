import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BriefcaseBusiness } from 'lucide-react-native';
import {
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  SettingsRow,
  SettingsSection,
} from '../../../components/AppDisplay';
import { CurrentUserProfile } from '../../../shared/models/types';
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
      <TopBar
        title={settings.data.pageTitle}
        subtitle={settings.data.pageSubtitle}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <SettingsSection title="Account">
            <SettingsRow
              icon={BriefcaseBusiness}
              label={settings.data.accountLabel}
              value={settings.data.accountValue}
            />
          </SettingsSection>
          {supportPanel}
          <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} />
          <SettingsSection title="Danger Zone">
            <Text style={styles.cardMeta}>{settings.data.deletePrompt}</Text>
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
          </SettingsSection>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
