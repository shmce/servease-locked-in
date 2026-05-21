import { StyleSheet, Text, View } from 'react-native';
import {
  Field,
  PrimaryButton,
} from '../../components/DesignKit';
import { palette, spacing } from '../../theme/serveaseDesign';

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
    <View style={styles.securityPanel}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  securityPanel: {
    gap: spacing.md,
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  cardMeta: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  monoText: {
    fontFamily: 'SpaceMono',
  },
});
