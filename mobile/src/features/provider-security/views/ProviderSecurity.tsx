import { ScrollView, StyleSheet, View } from 'react-native';
import { Section, TopBar } from '../../../components/DesignKit';
import { AppScreen } from '../../../navigation/types';
import { TwoFactorSettingsCard } from '../../../shared/components/TwoFactorSettingsCard';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderSecurityViewModel } from '../viewModels/useProviderSecurityViewModel';

type ProviderSecurityScreenProps = {
  busyAction: string | null;
  navigate: (screen: AppScreen, nextRole?: 'provider') => void;
  twoFactorCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  setTwoFactorCode: (value: string) => void;
  startTwoFactorSetup: () => void | Promise<void>;
  verifyTwoFactorSetup: () => void | Promise<void>;
  disableTwoFactorSetup: () => void | Promise<void>;
};

export function ProviderSecurityScreen({
  busyAction,
  navigate,
  twoFactorCode,
  twoFactorEnabled,
  twoFactorSecret,
  setTwoFactorCode,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: ProviderSecurityScreenProps) {
  const security = useProviderSecurityViewModel();

  return (
    <>
      <TopBar
        title={security.data.pageTitle}
        subtitle={security.data.pageSubtitle}
        onBack={() => navigate('more', 'provider')}
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Section title={security.data.sectionTitle}>
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
          </Section>
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
});
