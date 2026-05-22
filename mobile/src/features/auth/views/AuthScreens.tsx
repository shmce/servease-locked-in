import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
import { MonthCalendar, formatApiDate } from '../../../components/MonthCalendar';
import { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import { providerSignupRequirements } from '../../../domain/providerRegistration';
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
  signupBirthdate: string;
  signupServiceArea: string;
  signupServiceDescription: string;
  signupExperienceYears: string;
  notice: string;
  busyAction: string | null;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setSignupFullName: Dispatch<SetStateAction<string>>;
  setSignupContactNumber: Dispatch<SetStateAction<string>>;
  setSignupAddress: Dispatch<SetStateAction<string>>;
  setSignupBusinessName: Dispatch<SetStateAction<string>>;
  setSignupBirthdate: Dispatch<SetStateAction<string>>;
  setSignupServiceArea: Dispatch<SetStateAction<string>>;
  setSignupServiceDescription: Dispatch<SetStateAction<string>>;
  setSignupExperienceYears: Dispatch<SetStateAction<string>>;
  navigate: (screen: AppScreen, nextRole?: AppRole | null) => void;
  signIn: (role: AppRole) => Promise<void>;
  signUp: (role: AppRole) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  startGoogleSignIn: (role: AppRole) => Promise<void>;
};

export function AuthScreens({
  screen,
  email,
  password,
  signupFullName,
  signupContactNumber,
  signupAddress,
  signupBusinessName,
  signupBirthdate,
  signupServiceArea,
  signupServiceDescription,
  signupExperienceYears,
  notice,
  busyAction,
  setEmail,
  setPassword,
  setSignupFullName,
  setSignupContactNumber,
  setSignupAddress,
  setSignupBusinessName,
  setSignupBirthdate,
  setSignupServiceArea,
  setSignupServiceDescription,
  setSignupExperienceYears,
  navigate,
  signIn,
  signUp,
  requestPasswordReset,
  startGoogleSignIn,
}: AuthScreensProps) {
  const auth = useAuthViewModel();
  const { data, actions } = auth;
  const providerBirthdateMaxDate = getAdultBirthdateMaxDate();
  const [signupStep, setSignupStep] = useState(0);

  useEffect(() => {
    if (screen === 'customerRegistration' || screen === 'providerRegistration') {
      setSignupStep(0);
    }
  }, [screen]);

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
    const signupSteps = isProvider
      ? ['Account', 'Eligibility', 'Service']
      : ['Account', 'Address'];
    const stepCount = signupSteps.length;
    const clampedStep = Math.min(signupStep, stepCount - 1);
    const isLastStep = clampedStep === stepCount - 1;
    const stepTitle = signupSteps[clampedStep];
    const stepSubtitle = isProvider
      ? getProviderSignupStepSubtitle(clampedStep)
      : getCustomerSignupStepSubtitle(clampedStep);
    const goBack = () => {
      if (clampedStep > 0) {
        setSignupStep((step) => Math.max(step - 1, 0));
        return;
      }

      navigate('signupRole', null);
    };
    const goNext = () => setSignupStep((step) => Math.min(step + 1, stepCount - 1));
    const finalButtonLabel = busyAction === 'sign-up' ? 'Creating account...' : 'Create Account';

    return (
      <PhoneFrame>
        <StatusStrip />
        <TopBar title="Create Account" onBack={goBack} />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.authHero}>
            {isProvider ? 'Provider Signup' : 'Customer Signup'}
          </Text>
          <Text style={styles.authSubhead}>{stepSubtitle}</Text>
          <SignupProgress
            currentStep={clampedStep}
            steps={signupSteps}
          />
          <SignupStepHeader
            title={stepTitle}
            countLabel={`Step ${clampedStep + 1} of ${stepCount}`}
          />
          {clampedStep === 0 ? (
            <SignupAccountFields
              email={email}
              password={password}
              signupFullName={signupFullName}
              signupContactNumber={signupContactNumber}
              setEmail={setEmail}
              setPassword={setPassword}
              setSignupFullName={setSignupFullName}
              setSignupContactNumber={setSignupContactNumber}
            />
          ) : null}
          {!isProvider && clampedStep === 1 ? (
            <Field
              label="Default Address"
              value={signupAddress}
              onChangeText={setSignupAddress}
              placeholder="Unit, street, city"
              multiline
            />
          ) : null}
          {isProvider && clampedStep === 1 ? (
            <ProviderEligibilityStep
              signupBirthdate={signupBirthdate}
              setSignupBirthdate={setSignupBirthdate}
              providerBirthdateMaxDate={providerBirthdateMaxDate}
            />
          ) : null}
          {isProvider && clampedStep === 2 ? (
            <ProviderServiceStep
              signupBusinessName={signupBusinessName}
              signupServiceArea={signupServiceArea}
              signupExperienceYears={signupExperienceYears}
              signupServiceDescription={signupServiceDescription}
              setSignupBusinessName={setSignupBusinessName}
              setSignupServiceArea={setSignupServiceArea}
              setSignupExperienceYears={setSignupExperienceYears}
              setSignupServiceDescription={setSignupServiceDescription}
            />
          ) : null}
          <SignupStepActions
            canGoBack={clampedStep > 0}
            isLastStep={isLastStep}
            busy={busyAction === 'sign-up'}
            finalButtonLabel={finalButtonLabel}
            onBack={goBack}
            onNext={goNext}
            onSubmit={() => void signUp(intendedRole)}
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
            {(['email', 'google'] as const).map((method) => (
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
                  {method === 'email' ? 'Email' : 'Google'}
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
          <Text style={styles.noticeText}>{notice}</Text>
        </ScrollView>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <View style={styles.authGate}>
        <View style={styles.claireTopLeftAsset} pointerEvents="none">
          <Image
            source={claireImage2}
            style={styles.claireDecorativeImage}
            resizeMode="contain"
            accessible={false}
          />
        </View>
        <View style={styles.claireTopRightAsset} pointerEvents="none">
          <Image
            source={claireImg0157}
            style={styles.claireDecorativeImage}
            resizeMode="contain"
            accessible={false}
          />
        </View>
        <View style={styles.claireBottomLeftAsset} pointerEvents="none">
          <Image
            source={claireImage3}
            style={styles.claireDecorativeImage}
            resizeMode="contain"
            accessible={false}
          />
        </View>
        <View style={styles.claireBottomRightAsset} pointerEvents="none">
          <Image
            source={claireImage4}
            style={styles.claireDecorativeImage}
            resizeMode="contain"
            accessible={false}
          />
        </View>

        <View style={styles.claireLogoWrap} pointerEvents="none">
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
            style={styles.claireSignupButton}
            onPress={() => navigate('signupRole', null)}
            accessibilityRole="button"
          >
            <Text style={styles.claireSignupText}>
              Sign up for ServEase
            </Text>
          </Pressable>

          <Pressable
            style={styles.claireLoginButton}
            onPress={() => navigate('loginRole', null)}
            accessibilityRole="button"
          >
            <Text style={styles.claireLoginText}>
              Log in
            </Text>
          </Pressable>
        </View>
      </View>
    </PhoneFrame>
  );
}

function getAdultBirthdateMaxDate(): string {
  const today = new Date();
  return formatApiDate(
    new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()),
  );
}

function getProviderSignupStepSubtitle(step: number): string {
  if (step === 0) {
    return 'Start with your login and contact details';
  }

  if (step === 1) {
    return 'Confirm your provider eligibility';
  }

  return 'Describe the service customers will book';
}

function getCustomerSignupStepSubtitle(step: number): string {
  if (step === 0) {
    return 'Start with your login and contact details';
  }

  return 'Add where providers should serve you';
}

function SignupProgress({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <View style={styles.signupProgress}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                (isActive || isComplete) && styles.progressDotActive,
              ]}
            >
              <Text
                style={[
                  styles.progressDotText,
                  (isActive || isComplete) && styles.progressDotTextActive,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.progressLabel,
                isActive && styles.progressLabelActive,
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function SignupStepHeader({
  title,
  countLabel,
}: {
  title: string;
  countLabel: string;
}) {
  return (
    <View style={styles.signupStepHeader}>
      <Text style={styles.signupStepTitle}>{title}</Text>
      <Text style={styles.signupStepCount}>{countLabel}</Text>
    </View>
  );
}

function SignupAccountFields({
  email,
  password,
  signupFullName,
  signupContactNumber,
  setEmail,
  setPassword,
  setSignupFullName,
  setSignupContactNumber,
}: {
  email: string;
  password: string;
  signupFullName: string;
  signupContactNumber: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setSignupFullName: Dispatch<SetStateAction<string>>;
  setSignupContactNumber: Dispatch<SetStateAction<string>>;
}) {
  return (
    <>
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
    </>
  );
}

function ProviderEligibilityStep({
  signupBirthdate,
  setSignupBirthdate,
  providerBirthdateMaxDate,
}: {
  signupBirthdate: string;
  setSignupBirthdate: Dispatch<SetStateAction<string>>;
  providerBirthdateMaxDate: string;
}) {
  return (
    <>
      <ProviderRequirementsCard />
      <View style={styles.birthdatePicker}>
        <Text style={styles.birthdateLabel}>Birthdate</Text>
        <Text style={styles.birthdateValue}>
          {signupBirthdate || 'Select your birthdate'}
        </Text>
        <MonthCalendar
          selectedDate={signupBirthdate || null}
          onSelectDate={setSignupBirthdate}
          maxDate={providerBirthdateMaxDate}
          initialMonth={signupBirthdate || providerBirthdateMaxDate}
          showMonthYearPicker
        />
      </View>
    </>
  );
}

function ProviderServiceStep({
  signupBusinessName,
  signupServiceArea,
  signupExperienceYears,
  signupServiceDescription,
  setSignupBusinessName,
  setSignupServiceArea,
  setSignupExperienceYears,
  setSignupServiceDescription,
}: {
  signupBusinessName: string;
  signupServiceArea: string;
  signupExperienceYears: string;
  signupServiceDescription: string;
  setSignupBusinessName: Dispatch<SetStateAction<string>>;
  setSignupServiceArea: Dispatch<SetStateAction<string>>;
  setSignupExperienceYears: Dispatch<SetStateAction<string>>;
  setSignupServiceDescription: Dispatch<SetStateAction<string>>;
}) {
  return (
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
        label="Years of Experience"
        value={signupExperienceYears}
        onChangeText={setSignupExperienceYears}
        keyboardType="numeric"
        placeholder="3"
      />
      <Field
        label="Service Description"
        value={signupServiceDescription}
        onChangeText={setSignupServiceDescription}
        placeholder="Tell customers what you offer"
        multiline
      />
    </>
  );
}

function SignupStepActions({
  canGoBack,
  isLastStep,
  busy,
  finalButtonLabel,
  onBack,
  onNext,
  onSubmit,
}: {
  canGoBack: boolean;
  isLastStep: boolean;
  busy: boolean;
  finalButtonLabel: string;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.signupActions}>
      {canGoBack ? (
        <View style={styles.signupActionButton}>
          <PrimaryButton
            label="Back"
            onPress={onBack}
            disabled={busy}
            variant="secondary"
          />
        </View>
      ) : null}
      <View style={styles.signupActionButton}>
        <PrimaryButton
          label={isLastStep ? finalButtonLabel : 'Next'}
          onPress={isLastStep ? onSubmit : onNext}
          disabled={busy}
        />
      </View>
    </View>
  );
}

function ProviderRequirementsCard() {
  return (
    <View style={styles.requirementsCard}>
      <Text style={styles.requirementsTitle}>Required for admin approval</Text>
      {providerSignupRequirements.map((requirement) => (
        <View key={requirement} style={styles.requirementRow}>
          <View style={styles.requirementIcon}>
            <Check color={palette.mint} size={12} strokeWidth={3} />
          </View>
          <Text style={styles.requirementText}>{requirement}</Text>
        </View>
      ))}
      <Text style={styles.requirementNote}>
        You can upload the government ID from the provider home screen after the
        account is created.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  authGate: {
    backgroundColor: palette.mint,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  claireTopLeftAsset: {
    height: 254,
    left: -55,
    position: 'absolute',
    top: -50,
    width: 160,
  },
  claireTopRightAsset: {
    height: 316,
    position: 'absolute',
    right: -35,
    top: -50,
    width: 150,
  },
  claireBottomLeftAsset: {
    bottom: -55,
    height: 232,
    left: -45,
    position: 'absolute',
    transform: [{ rotate: '180deg' }],
    width: 180,
  },
  claireBottomRightAsset: {
    bottom: -30,
    height: 198,
    position: 'absolute',
    right: -45,
    width: 200,
  },
  claireDecorativeImage: {
    height: '100%',
    width: '100%',
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
    elevation: 4,
    gap: 19,
    left: 20,
    position: 'absolute',
    right: 20,
    top: 445,
    zIndex: 4,
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
  signupProgress: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  progressDot: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.lineSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  progressDotActive: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  progressDotText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  progressDotTextActive: {
    color: palette.white,
  },
  progressLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: palette.ink,
  },
  signupStepHeader: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  signupStepTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  signupStepCount: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  signupActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  signupActionButton: {
    flex: 1,
  },
  requirementsCard: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  requirementsTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  requirementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requirementIcon: {
    alignItems: 'center',
    backgroundColor: '#E9F9F0',
    borderRadius: radius.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  requirementText: {
    color: palette.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  requirementNote: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: spacing.xs,
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
  birthdatePicker: {
    gap: spacing.sm,
  },
  birthdateLabel: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  birthdateValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
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
