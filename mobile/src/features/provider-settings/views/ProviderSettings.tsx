import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BriefcaseBusiness } from 'lucide-react-native';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title={settings.data.pageTitle}
          subtitle={settings.data.pageSubtitle}
          onBack={onBack}
        />

        <ProviderSection title="Account">
          <ProviderCard>
            <View style={styles.accountRow}>
              <ProviderIconBlock compact>
                <BriefcaseBusiness
                  color={palette.mintDeep}
                  size={18}
                  strokeWidth={2.2}
                />
              </ProviderIconBlock>
              <View style={styles.flex}>
                <Text style={styles.accountLabel}>{settings.data.accountLabel}</Text>
                <Text style={styles.accountValue}>{settings.data.accountValue}</Text>
              </View>
            </View>
          </ProviderCard>
        </ProviderSection>

        {supportPanel}

        <ProviderButton
          label="Sign out"
          variant="secondary"
          onPress={signOut}
        />

        <ProviderSection title="Danger Zone">
          <ProviderCard>
            <Text style={styles.dangerHint}>
              Type{' '}
              <Text style={styles.dangerEmail}>
                {profile?.user.email ?? 'your email'}
              </Text>{' '}
              to confirm account deletion.
            </Text>
            <ProviderTextField
              label="Confirm email"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={settings.data.deletePlaceholder}
              keyboardType="email-address"
            />
            <ProviderButton
              label={settings.data.deleteButtonLabel}
              variant="danger"
              onPress={() => void deleteMyAccount()}
              disabled={settings.data.isDeleting || !settings.data.canConfirmAccountDeletion}
            />
          </ProviderCard>
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  accountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  accountLabel: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  accountValue: {
    ...providerText.meta,
    marginTop: 2,
  },
  dangerHint: {
    ...providerText.body,
  },
  dangerEmail: {
    color: '#202733',
    fontWeight: '600',
  },
});
