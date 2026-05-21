import { ScrollView, StyleSheet, View } from 'react-native';
import { Section, TopBar } from '../../../components/DesignKit';
import { TwoFactorSettingsCard } from '../../../shared/components/TwoFactorSettingsCard';
import { palette, spacing } from '../../../theme/serveaseDesign';

type CustomerSecurityScreenProps = {
  busyAction: string | null;
  onBack: () => void;
  twoFactorCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  setTwoFactorCode: (value: string) => void;
  startTwoFactorSetup: () => void | Promise<void>;
  verifyTwoFactorSetup: () => void | Promise<void>;
  disableTwoFactorSetup: () => void | Promise<void>;
};

export function CustomerSecurityScreen({
  busyAction,
  onBack,
  twoFactorCode,
  twoFactorEnabled,
  twoFactorSecret,
  setTwoFactorCode,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: CustomerSecurityScreenProps) {
  return (
    <>
      <TopBar
        title="Security"
        subtitle="Protect your account"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Section title="Two-Factor Authentication">
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
  scroll: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
});
