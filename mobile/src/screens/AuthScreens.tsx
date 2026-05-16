import { Dispatch, SetStateAction, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Field, PhoneFrame, PrimaryButton, StatusStrip, TopBar } from '../components/DesignKit';
import { RoleCard } from '../components/AppDisplay';
import { AppRole, AppScreen } from '../navigation/types';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';

const claireImage2 = require('../../assets/image 2.png');
const claireImage3 = require('../../assets/image 3.png');
const claireImage4 = require('../../assets/image 4.png');
const claireImg0157 = require('../../assets/IMG_0157 1.png');
const claireLogo = require('../../assets/servease-logo.png');

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
}: AuthScreensProps) {
  const [isAgreed, setIsAgreed] = useState(false);

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
        <TopBar title="Login" onBack={() => navigate('loginRole', null)} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>Welcome!</Text>
          <Text style={styles.authSubhead}>Login to continue to ServEase</Text>
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
            label={busyAction === 'sign-in' ? 'Logging in...' : 'Login'}
            onPress={() => void signIn(intendedRole)}
            disabled={busyAction === 'sign-in'}
          />
          <Text
            style={styles.forgotLink}
            onPress={() => void requestPasswordReset()}
          >
            {busyAction === 'password-reset' ? 'Sending reset link...' : 'Forgot Password?'}
          </Text>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>
          <Pressable
            style={styles.socialButton}
            onPress={() => setNotice('Google sign-in needs native auth setup before enabling.')}
          >
            <Text style={styles.googleMark}>G</Text>
            <Text style={styles.socialText}>Continue with Google</Text>
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => setNotice('Phone login needs OTP backend support before enabling.')}
          >
            <Text style={styles.phoneMark}>P</Text>
            <Text style={styles.socialText}>Continue with Phone Number</Text>
          </Pressable>
          <Text style={styles.noticeText}>{notice}</Text>
        </ScrollView>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={styles.authGate}>
        <View style={styles.claireTopLeftWrap}>
          <Image source={claireImage2} style={styles.claireTopLeftAsset} resizeMode="stretch" />
        </View>
        <Image source={claireImg0157} style={styles.claireTopRightAsset} resizeMode="stretch" />
        <View style={styles.claireBottomLeftWrap}>
          <Image source={claireImage3} style={styles.claireBottomLeftAsset} resizeMode="stretch" />
        </View>
        <Image source={claireImage4} style={styles.claireBottomRightAsset} resizeMode="stretch" />

        <View style={styles.claireLogoWrap}>
          <Image source={claireLogo} style={styles.claireLogoImage} resizeMode="contain" />
        </View>

        <Text style={styles.claireTagline}>
          Finding and connecting with trusted local professionals around you.
        </Text>

        <View style={styles.claireActions}>
          <Pressable
            style={[
              styles.claireSignupButton,
              !isAgreed && styles.claireButtonDisabled,
            ]}
            onPress={() => {
              if (!isAgreed) {
                return;
              }
              navigate('signupRole', null);
            }}
            disabled={!isAgreed}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.claireSignupText,
                !isAgreed && styles.claireSignupTextDisabled,
              ]}
            >
              Sign up to ServEase
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.claireLoginButton,
              !isAgreed && styles.claireLoginButtonDisabled,
            ]}
            onPress={() => {
              if (isAgreed) {
                navigate('loginRole', null);
              }
            }}
            disabled={!isAgreed}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.claireLoginText,
                !isAgreed && styles.claireLoginTextDisabled,
              ]}
            >
              Log In
            </Text>
          </Pressable>
        </View>

        <View style={styles.legalWrap}>
          <Pressable
            style={styles.legalRow}
            onPress={() => setIsAgreed((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isAgreed }}
          >
            <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
              {isAgreed ? <Check color={palette.mint} size={13} strokeWidth={3} /> : null}
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
    position: 'absolute',
    top: 285,
    width: '100%',
  },
  claireLogoImage: {
    height: 53,
    width: 293,
  },
  claireTagline: {
    color: palette.white,
    fontSize: 15,
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
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  claireLoginTextDisabled: {
    color: 'rgba(255,255,255,0.45)',
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
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
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
    fontSize: 14,
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
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '900',
  },
  socialText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    textAlign: 'center',
  },
});
