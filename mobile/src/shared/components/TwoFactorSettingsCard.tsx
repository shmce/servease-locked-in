import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Field,
  PrimaryButton,
} from '../../components/DesignKit';
import { palette, spacing, type } from '../../theme/serveaseDesign';

type TwoFactorSettingsCardProps = {
  busyAction: string | null;
  twoFactorCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  onCodeChange: (value: string) => void;
  startTwoFactorSetup: () => void | Promise<void>;
  verifyTwoFactorSetup: () => void | Promise<void>;
  disableTwoFactorSetup: () => void | Promise<void>;
};

export function TwoFactorSettingsCard({
  busyAction,
  twoFactorCode,
  twoFactorEnabled,
  twoFactorSecret,
  onCodeChange,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: TwoFactorSettingsCardProps) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
      <Text style={styles.cardMeta}>
        {twoFactorEnabled
          ? '2FA is enabled. Enter a current code to disable it.'
          : 'Protect your account with a code from an authenticator app.'}
      </Text>
      {twoFactorSecret ? (
        <Text style={[styles.cardMeta, styles.monoText]}>
          Secret: {twoFactorSecret}
        </Text>
      ) : null}
      <Field
        label="Authenticator Code"
        value={twoFactorCode}
        onChangeText={onCodeChange}
        placeholder="6-digit code"
        keyboardType="number-pad"
      />
      <View style={styles.twoButtons}>
        <PrimaryButton
          label={
            busyAction === 'two-factor-enable'
              ? 'Starting...'
              : twoFactorEnabled
                ? '2FA Enabled'
                : 'Start Setup'
          }
          variant="secondary"
          onPress={() => void startTwoFactorSetup()}
          disabled={twoFactorEnabled || busyAction === 'two-factor-enable'}
        />
        <PrimaryButton
          label={
            busyAction === 'two-factor-verify'
              ? 'Verifying...'
              : twoFactorEnabled
                ? 'Disable'
                : 'Verify'
          }
          onPress={() =>
            twoFactorEnabled
              ? void disableTwoFactorSetup()
              : void verifyTwoFactorSetup()
          }
          disabled={
            busyAction === 'two-factor-verify' ||
            busyAction === 'two-factor-disable'
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  monoText: {
    fontFamily: 'SpaceMono',
  },
});
