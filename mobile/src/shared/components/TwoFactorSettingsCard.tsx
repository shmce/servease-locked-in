import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CustomerCard,
  customerText,
} from './CustomerUI';
import {
  ProviderActionRow,
  ProviderButton,
  ProviderCard,
  ProviderTextField,
  providerText,
} from './ProviderUI';
import { palette, radius, spacing } from '../../theme/serveaseDesign';

type TwoFactorSettingsCardProps = {
  busyAction: string | null;
  twoFactorCode: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  variant?: 'customer';
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
  variant,
  onCodeChange,
  startTwoFactorSetup,
  verifyTwoFactorSetup,
  disableTwoFactorSetup,
}: TwoFactorSettingsCardProps) {
  const primaryLabel =
    busyAction === 'two-factor-verify'
      ? 'Verifying...'
      : twoFactorEnabled
        ? 'Disable'
        : 'Verify';

  if (variant === 'customer') {
    return (
      <CustomerCard style={styles.customerSecurityPanel}>
        <Text style={styles.customerTitle}>Two-factor authentication</Text>
        <Text style={styles.customerMeta}>
          {twoFactorEnabled
            ? '2FA is enabled. Enter a current code to disable it.'
            : 'Protect your account with a code from an authenticator app.'}
        </Text>
        {twoFactorSecret ? (
          <Text style={[styles.customerMeta, styles.monoText]}>
            Secret: {twoFactorSecret}
          </Text>
        ) : null}
        <View style={styles.customerField}>
          <Text style={styles.customerLabel}>Authenticator code</Text>
          <TextInput
            style={styles.customerInput}
            value={twoFactorCode}
            onChangeText={onCodeChange}
            placeholder="6-digit code"
            placeholderTextColor="#A7AFB8"
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.customerTwoButtons}>
          <Pressable
            style={[
              styles.customerSecondaryButton,
              (twoFactorEnabled || busyAction === 'two-factor-enable') &&
                styles.customerButtonDisabled,
            ]}
            onPress={() => void startTwoFactorSetup()}
            disabled={twoFactorEnabled || busyAction === 'two-factor-enable'}
            accessibilityRole="button"
          >
            <Text style={styles.customerSecondaryButtonText}>
              {busyAction === 'two-factor-enable'
                ? 'Starting...'
                : twoFactorEnabled
                  ? '2FA Enabled'
                  : 'Start Setup'}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.customerPrimaryButton,
              (busyAction === 'two-factor-verify' ||
                busyAction === 'two-factor-disable') &&
                styles.customerButtonDisabled,
            ]}
            onPress={() =>
              twoFactorEnabled
                ? void disableTwoFactorSetup()
                : void verifyTwoFactorSetup()
            }
            disabled={
              busyAction === 'two-factor-verify' ||
              busyAction === 'two-factor-disable'
            }
            accessibilityRole="button"
          >
            <Text style={styles.customerPrimaryButtonText}>{primaryLabel}</Text>
          </Pressable>
        </View>
      </CustomerCard>
    );
  }

  return (
    <ProviderCard style={styles.securityPanel}>
      <Text style={styles.providerTitle}>Two-Factor Authentication</Text>
      <Text style={styles.providerMeta}>
        {twoFactorEnabled
          ? '2FA is enabled. Enter a current code to disable it.'
          : 'Protect your account with a code from an authenticator app.'}
      </Text>
      {twoFactorSecret ? (
        <Text style={[styles.providerMeta, styles.monoText]}>
          Secret: {twoFactorSecret}
        </Text>
      ) : null}
      <ProviderTextField
        label="Authenticator Code"
        value={twoFactorCode}
        onChangeText={onCodeChange}
        placeholder="6-digit code"
        keyboardType="number-pad"
      />
      <ProviderActionRow>
        <ProviderButton
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
        <ProviderButton
          label={primaryLabel}
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
      </ProviderActionRow>
    </ProviderCard>
  );
}

const styles = StyleSheet.create({
  customerSecurityPanel: {
    gap: spacing.md,
  },
  customerTitle: {
    ...customerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  customerMeta: {
    ...customerText.body,
  },
  customerField: {
    gap: spacing.xs,
  },
  customerLabel: {
    ...customerText.meta,
    color: '#7A828D',
  },
  customerInput: {
    ...customerText.body,
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customerTwoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customerPrimaryButton: {
    alignItems: 'center',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  customerSecondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  customerPrimaryButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  customerSecondaryButtonText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  customerButtonDisabled: {
    opacity: 0.45,
  },
  securityPanel: {
    gap: spacing.md,
  },
  providerTitle: {
    ...providerText.title,
    fontSize: 16,
    lineHeight: 21,
  },
  providerMeta: {
    ...providerText.body,
  },
  monoText: {
    fontFamily: 'SpaceMono',
  },
});
