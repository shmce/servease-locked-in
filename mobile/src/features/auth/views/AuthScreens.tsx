import { Dispatch, SetStateAction } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import {
  Field,
  PhoneFrame,
  PrimaryButton,
  StatusStrip,
  TopBar,
} from '../../../components/DesignKit';
import { RoleCard } from '../../../components/AppDisplay';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { useAuthViewModel } from '../viewModels/useAuthViewModel';

const claireImage2 = require('../../../../assets/image 2.png');
const claireImage3 = require('../../../../assets/image 3.png');
const claireImage4 = require('../../../../assets/image 4.png');
const claireImg0157 = require('../../../../assets/IMG_0157 1.png');
const claireLogo = require('../../../../assets/servease-logo.png');

type AuthScreensProps = {
  screen: AppScreen;
  email: string;
  password: string;
  signupFullName: string;
  signupContactNumber: string;
  signupAddress: string;
  signupBusinessName: string;
  signupServiceArea: string;
  signupServiceDescription: string;
  notice: string;
  busyAction: string | null;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setSignupFullName: Dispatch<SetStateAction<string>>;
  setSignupContactNumber: Dispatch<SetStateAction<string>>;
  setSignupAddress: Dispatch<SetStateAction<string>>;
  setSignupBusinessName: Dispatch<SetStateAction<string>>;
  setSignupServiceArea: Dispatch<SetStateAction<string>>;
  setSignupServiceDescription: Dispatch<SetStateAction<string>>;
  setNotice: Dispatch<SetStateAction<string>>;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  signIn: (role: AppRole) => Promise<void>;
  signUp: (role: AppRole) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  startGoogleSignIn: (role: AppRole) => Promise<void>;
  requestPhoneOtp: (target: string) => Promise<string | null>;
  verifyPhoneOtp: (otpId: string, code: string) => Promise<boolean>;
};

export function AuthScreens({
  screen,
  email,
  password,
  signupFullName,
  signupContactNumber,
  signupAddress,
  signupBusinessName,
  signupServiceArea,
  signupServiceDescription,
  notice,
  busyAction,
  setEmail,
  setPassword,
  setSignupFullName,
  setSignupContactNumber,
  setSignupAddress,
  setSignupBusinessName,
  setSignupServiceArea,
  setSignupServiceDescription,
  setNotice,
  navigate,
  signIn,
  signUp,
  requestPasswordReset,
  startGoogleSignIn,
  requestPhoneOtp,
  verifyPhoneOtp,
}: AuthScreensProps) {
  const auth = useAuthViewModel({
    requestPhoneOtp,
    verifyPhoneOtp,
    setNotice,
  });
  const { data, actions } = auth;

  if (screen === 'loginRole') {
    return (
      <PhoneFrame>
        <StatusStrip />
        <TopBar title="Login" onBack={() => navigate('authGate', null)} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>Welcome!</Text>
          <Text style={styles.authSubhead}>Choose how you want to continue</Text>
          <RoleCard
            title="Customer"
            body="Find and book services"
            mark="C"
            onPress={() => navigate('customerLogin', 'customer')}
          />
          <RoleCard
            title="Service Provider"
            body="Offer services and manage bookings"
            mark="S"
            onPress={() => navigate('providerLogin', 'provider')}
          />
        </ScrollView>
      </PhoneFrame>
    );
  }

  if (screen === 'signupRole') {
    return (
      <PhoneFrame>
        <StatusStrip />
        <TopBar title="Sign up" onBack={() => navigate('authGate', null)} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>Create Account</Text>
          <Text style={styles.authSubhead}>Choose the account you want to create</Text>
          <RoleCard
            title="Customer"
            body="Book trusted local services"
            mark="C"
            onPress={() => navigate('customerRegistration', 'customer')}
          />
          <RoleCard
            title="Service Provider"
            body="Offer services and manage work"
            mark="S"
            onPress={() => navigate('providerRegistration', 'provider')}
          />
          <Text style={styles.noticeText}>{notice}</Text>
        </ScrollView>
      </PhoneFrame>
    );
  }

  if (screen === 'customerRegistration' || screen === 'providerRegistration') {
    const intendedRole: AppRole =
      screen === 'providerRegistration' ? 'provider' : 'customer';
    const isProvider = intendedRole === 'provider';

    return (
      <PhoneFrame>
        <StatusStrip />
        <TopBar title="Create Account" onBack={() => navigate('signupRole', null)} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>
            {isProvider ? 'Provider Signup' : 'Customer Signup'}
          </Text>
          <Text style={styles.authSubhead}>Set up your ServEase account</Text>
          <Field
            label="Full Name"
            value={signupFullName}
            onChangeText={setSignupFullName}
            placeholder="Juan Dela Cruz"
          />
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
            placeholder="At least 8 characters"
          />
          <Field
            label="Contact Number"
            value={signupContactNumber}
            onChangeText={setSignupContactNumber}
            keyboardType="phone-pad"
            placeholder="+639000000000"
          />
          {isProvider ? (
            <>
              <Field
                label="Business Name"
                value={signupBusinessName}
                onChangeText={setSignupBusinessName}
                placeholder="GreenFix Home Services"
              />
              <Field
                label="Service Area"
                value={signupServiceArea}
                onChangeText={setSignupServiceArea}
                placeholder="Metro Manila"
              />
              <Field
                label="Service Description"
                value={signupServiceDescription}
                onChangeText={setSignupServiceDescription}
                placeholder="Tell customers what you offer"
                multiline
              />
            </>
          ) : (
            <Field
              label="Default Address"
              value={signupAddress}
              onChangeText={setSignupAddress}
              placeholder="Unit, street, city"
              multiline
            />
          )}
          <PrimaryButton
            label={busyAction === 'sign-up' ? 'Creating account...' : 'Create Account'}
            onPress={() => void signUp(intendedRole)}
            disabled={busyAction === 'sign-up'}
          />
          <Text style={styles.noticeText}>{notice}</Text>
        </ScrollView>
      </PhoneFrame>
    );
  }

  if (screen === 'customerLogin' || screen === 'providerLogin') {
    const intendedRole: AppRole = screen === 'providerLogin' ? 'provider' : 'customer';

    return (
      <PhoneFrame>
        <StatusStrip />
        <TopBar title="Log in" onBack={() => navigate('loginRole', null)} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>Welcome!</Text>
          <Text style={styles.authSubhead}>Choose one sign-in method</Text>
          <View style={styles.methodTabs}>
            {(['email', 'google', 'phone'] as const).map((method) => (
              <Pressable
                key={method}
                style={[
                  styles.methodTab,
                  data.loginMethod === method && styles.methodTabSelected,
                ]}
                onPress={() => actions.setLoginMethod(method)}
                accessibilityRole="button"
                accessibilityState={{ selected: data.loginMethod === method }}
              >
                <Text
                  style={[
                    styles.methodTabText,
                    data.loginMethod === method && styles.methodTabTextSelected,
                  ]}
                >
                  {method === 'email' ? 'Email' : method === 'google' ? 'Google' : 'Phone'}
                </Text>
              </Pressable>
            ))}
          </View>
          {data.loginMethod === 'email' ? (
            <>
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
                disabled={busyAction === 'sign-in'}
              />
              <Text
                style={styles.forgotLink}
                onPress={() => void requestPasswordReset()}
              >
                {busyAction === 'password-reset' ? 'Sending reset link...' : 'Forgot Password?'}
              </Text>
            </>
          ) : null}
          {data.loginMethod === 'google' ? (
            <Pressable
              style={styles.socialButton}
              onPress={() => void startGoogleSignIn(intendedRole)}
              disabled={busyAction === 'google-auth'}
              accessibilityRole="button"
            >
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.socialText}>
                {busyAction === 'google-auth' ? 'Opening Google...' : 'Continue with Google'}
              </Text>
            </Pressable>
          ) : null}
          {data.loginMethod === 'phone' ? (
            <>
              <Field
                label="Phone Verification"
                value={data.phoneLoginTarget}
                onChangeText={actions.updatePhoneLoginTarget}
                keyboardType="phone-pad"
                placeholder="+639000000000"
              />
              <Pressable
                style={styles.socialButton}
                onPress={() => void actions.sendPhoneOtp()}
                disabled={busyAction === 'otp-generate'}
                accessibilityRole="button"
              >
                <Text style={styles.phoneMark}>P</Text>
                <Text style={styles.socialText}>
                  {busyAction === 'otp-generate'
                    ? 'Sending OTP...'
                    : 'Send Phone Verification OTP'}
                </Text>
              </Pressable>
            </>
          ) : null}
          {data.loginMethod === 'phone' && data.phoneOtpId ? (
            <>
              <Field
                label="OTP Code"
                value={data.phoneOtpCode}
                onChangeText={actions.setPhoneOtpCode}
                keyboardType="number-pad"
                placeholder="6-digit code"
              />
              <PrimaryButton
                label={busyAction === 'otp-verify' ? 'Verifying OTP...' : 'Verify OTP'}
                onPress={() => void actions.verifyPhoneOtpCode()}
                disabled={
                  busyAction === 'otp-verify' || data.phoneOtpCode.trim().length < 4
                }
                variant="secondary"
              />
            </>
          ) : null}
          <Text style={styles.noticeText}>{notice}</Text>
        </ScrollView>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={styles.authGate}>
        <View style={styles.claireTopLeftWrap}>
          <Image
            source={claireImage2}
            style={styles.claireTopLeftAsset}
            resizeMode="stretch"
            accessible={false}
          />
        </View>
        <Image
          source={claireImg0157}
          style={styles.claireTopRightAsset}
          resizeMode="stretch"
          accessible={false}
        />
        <View style={styles.claireBottomLeftWrap}>
          <Image
            source={claireImage3}
            style={styles.claireBottomLeftAsset}
            resizeMode="stretch"
            accessible={false}
          />
        </View>
        <Image
          source={claireImage4}
          style={styles.claireBottomRightAsset}
          resizeMode="stretch"
          accessible={false}
        />

        <View style={styles.claireLogoWrap}>
          <Image
            source={claireLogo}
            style={styles.claireLogoImage}
            resizeMode="contain"
            accessibilityLabel="ServEase"
          />
        </View>

        <Text style={styles.claireTagline}>
          Finding and connecting with trusted local professionals around you.
        </Text>

        <View style={styles.claireActions}>
          <Pressable
            style={[
              styles.claireSignupButton,
              !data.isAgreed && styles.claireButtonDisabled,
            ]}
            onPress={() => {
              if (!data.isAgreed) {
                return;
              }
              navigate('signupRole', null);
            }}
            disabled={!data.isAgreed}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.claireSignupText,
                !data.isAgreed && styles.claireSignupTextDisabled,
              ]}
            >
              Sign up for ServEase
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.claireLoginButton,
              !data.isAgreed && styles.claireLoginButtonDisabled,
            ]}
            onPress={() => {
              if (data.isAgreed) {
                navigate('loginRole', null);
              }
            }}
            disabled={!data.isAgreed}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.claireLoginText,
                !data.isAgreed && styles.claireLoginTextDisabled,
              ]}
            >
              Log in
            </Text>
          </Pressable>
          {!data.isAgreed ? (
            <Text style={styles.legalHint}>Agree to the terms to continue.</Text>
          ) : null}
        </View>

        <View style={styles.legalWrap}>
          <Pressable
            style={styles.legalRow}
            onPress={() => actions.setIsAgreed((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: data.isAgreed }}
          >
            <View style={[styles.checkbox, data.isAgreed && styles.checkboxChecked]}>
              {data.isAgreed ? (
                <Check color={palette.mint} size={13} strokeWidth={3} />
              ) : null}
            </View>
            <Text style={styles.legalText}>
              I have read and agree to the{' '}
              <Text style={styles.legalLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>.
            </Text>
          </Pressable>
        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  authGate: {
    backgroundColor: palette.mint,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  claireTopLeftWrap: {
    height: 166,
    left: -48,
    position: 'absolute',
    top: -4,
    width: 160,
  },
  claireTopLeftAsset: {
    height: 166,
    transform: [{ rotate: '180deg' }],
    width: 160,
  },
  claireTopRightAsset: {
    height: 264,
    left: 266,
    position: 'absolute',
    top: -4,
    width: 160,
  },
  claireBottomLeftWrap: {
    alignItems: 'center',
    height: 230,
    justifyContent: 'center',
    left: -82,
    position: 'absolute',
    top: 655,
    width: 247,
  },
  claireBottomLeftAsset: {
    height: 171,
    transform: [{ rotate: '159.59deg' }],
    width: 200,
  },
  claireBottomRightAsset: {
    height: 154,
    left: 247,
    position: 'absolute',
    top: 684,
    width: 200,
  },
  claireLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 285,
  },
  claireLogoImage: {
    height: 53,
    width: 293,
  },
  claireTagline: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '500',
    left: 27,
    lineHeight: 23,
    position: 'absolute',
    textAlign: 'center',
    top: 365,
    width: 336,
  },
  claireActions: {
    gap: 19,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 445,
  },
  claireSignupButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 54,
  },
  claireButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  claireSignupText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 21,
  },
  claireSignupTextDisabled: {
    color: 'rgba(86,196,144,0.45)',
  },
  claireLoginButton: {
    alignItems: 'center',
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
  },
  claireLoginButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.3)',
  },
  claireLoginText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 21,
  },
  claireLoginTextDisabled: {
    color: 'rgba(255,255,255,0.45)',
  },
  legalHint: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },
  legalWrap: {
    left: 35,
    position: 'absolute',
    right: 35,
    top: 612,
  },
  legalRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: palette.white,
    borderRadius: 5,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    marginTop: 3,
    width: 18,
  },
  checkboxChecked: {
    backgroundColor: palette.white,
  },
  legalText: {
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 18,
  },
  legalLink: {
    color: palette.white,
    fontSize: 11,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  authContent: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  authHero: {
    ...type.hero,
    color: palette.ink,
  },
  authSubhead: {
    ...type.body,
    color: palette.muted,
    marginTop: -spacing.md,
  },
  forgotLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  divider: {
    backgroundColor: palette.line,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '500',
  },
  methodTabs: {
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  methodTab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  methodTabSelected: {
    backgroundColor: palette.white,
  },
  methodTabText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  methodTabTextSelected: {
    color: palette.mint,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.base,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  phoneMark: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  socialText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
});
