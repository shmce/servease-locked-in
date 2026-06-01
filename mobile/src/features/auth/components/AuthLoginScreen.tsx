import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mail } from 'lucide-react-native';
import {
  Field,
  PhoneFrame,
  PrimaryButton,
  StatusStrip,
  TopBar,
} from '../../../components/DesignKit';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { AuthContent, AuthHeader, AuthNotice, AuthPanel, SocialButton } from './AuthShared';

type LoginMethod = 'email' | 'google';

export function AuthLoginScreen({
  screen,
  email,
  password,
  notice,
  busyAction,
  loginMethod,
  setLoginMethod,
  setEmail,
  setPassword,
  navigate,
  signIn,
  requestPasswordReset,
  startGoogleSignIn,
}: {
  screen: 'customerLogin' | 'providerLogin';
  email: string;
  password: string;
  notice: string;
  busyAction: string | null;
  loginMethod: LoginMethod;
  setLoginMethod: (method: LoginMethod) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  signIn: (role: AppRole) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  startGoogleSignIn: (role: AppRole, flow?: 'login' | 'registration') => Promise<void>;
}) {
  const intendedRole: AppRole = screen === 'providerLogin' ? 'provider' : 'customer';
  const isProvider = intendedRole === 'provider';
  const loginTitle = isProvider ? 'Provider login' : 'Customer login';
  const loginBody = isProvider
    ? 'Access bookings, availability, and service work for your provider profile.'
    : 'Access bookings, addresses, payments, and service updates for your customer account.';

  return (
    <PhoneFrame>
      <StatusStrip />
      <TopBar
        title="Log in"
        subtitle={isProvider ? 'Service provider' : 'Customer'}
        onBack={() => navigate('loginRole', null)}
      />
      <AuthContent>
        <AuthHeader
          eyebrow={isProvider ? 'Service provider' : 'Customer'}
          title={loginTitle}
          body={loginBody}
        />
        <View style={styles.methodTabs}>
          {(['email', 'google'] as const).map((method) => (
            <Pressable
              key={method}
              style={[
                styles.methodTab,
                loginMethod === method && styles.methodTabSelected,
                busyAction !== null && styles.methodTabBusy,
              ]}
              onPress={() => setLoginMethod(method)}
              disabled={busyAction !== null}
              accessibilityRole="button"
              accessibilityLabel={`Use ${method === 'email' ? 'email' : 'Google'} login`}
              accessibilityState={{
                disabled: busyAction !== null,
                selected: loginMethod === method,
              }}
            >
              {method === 'email' ? (
                <Mail
                  color={loginMethod === method ? palette.mintDeep : palette.muted}
                  size={16}
                  strokeWidth={2.4}
                />
              ) : (
                <Text style={styles.methodGoogleMark}>G</Text>
              )}
              <Text
                style={[
                  styles.methodTabText,
                  loginMethod === method && styles.methodTabTextSelected,
                ]}
              >
                {method === 'email' ? 'Email' : 'Google'}
              </Text>
            </Pressable>
          ))}
        </View>
        {loginMethod === 'email' ? (
          <AuthPanel>
            <Field
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="your.email@example.com"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
            />
            <PrimaryButton
              label={busyAction === 'sign-in' ? 'Logging in...' : 'Log in'}
              onPress={() => void signIn(intendedRole)}
              disabled={busyAction !== null}
            />
            <Pressable
              style={styles.forgotButton}
              onPress={() => void requestPasswordReset()}
              disabled={busyAction === 'password-reset'}
              accessibilityRole="button"
              accessibilityLabel="Send password reset link"
              accessibilityState={{ disabled: busyAction === 'password-reset' }}
            >
              <Text style={styles.forgotLink}>
                {busyAction === 'password-reset' ? 'Sending reset link...' : 'Forgot password?'}
              </Text>
            </Pressable>
          </AuthPanel>
        ) : null}
        {loginMethod === 'google' ? (
          <SocialButton
            label={busyAction === 'google-auth' ? 'Opening Google...' : 'Continue with Google'}
            onPress={() => void startGoogleSignIn(intendedRole)}
            disabled={busyAction === 'google-auth'}
          />
        ) : null}
        <AuthNotice notice={notice} />
      </AuthContent>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  methodTabs: {
    backgroundColor: palette.white,
    borderColor: 'rgba(86,196,144,0.12)',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    shadowColor: '#113C2B',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  methodTab: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 46,
  },
  methodTabSelected: {
    backgroundColor: palette.mintSoft,
  },
  methodTabBusy: {
    opacity: 0.72,
  },
  methodTabText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  methodTabTextSelected: {
    color: palette.mintDeep,
  },
  methodGoogleMark: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  forgotLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  forgotButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
