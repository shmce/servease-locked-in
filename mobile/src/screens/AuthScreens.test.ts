import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('auth screens use APICenter Google handlers and do not expose phone OTP auth', () => {
  const screenSource = readFileSync(
    join(process.cwd(), 'src/screens/AuthScreens.tsx'),
    'utf8',
  );
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/auth/views/AuthScreens.tsx'),
    'utf8',
  );
  const viewModelSource = readFileSync(
    join(process.cwd(), 'src/features/auth/viewModels/useAuthViewModel.ts'),
    'utf8',
  );

  assert.match(screenSource, /features\/auth\/views\/AuthScreens/);
  assert.match(viewSource, /startGoogleSignIn/);
  assert.match(viewModelSource, /LoginMethod = 'email' \| 'google'/);
  assert.doesNotMatch(viewModelSource, /requestPhoneOtp|verifyPhoneOtp|phoneOtp/);
  assert.doesNotMatch(viewSource, /Phone Verification|Send Phone Verification OTP|Verify OTP/);
  assert.doesNotMatch(viewSource, /needs native auth setup before enabling/);
  assert.doesNotMatch(viewSource, /needs OTP backend support before enabling/);
});

test('provider signup shows admin approval requirements before account creation', () => {
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/auth/views/AuthScreens.tsx'),
    'utf8',
  );
  const registrationSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthRegistrationScreen.tsx'),
    'utf8',
  );
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const domainSource = readFileSync(
    join(process.cwd(), 'src/domain/providerRegistration.ts'),
    'utf8',
  );

  assert.match(viewSource, /AuthRegistrationScreen/);
  assert.match(registrationSource, /Required for admin approval/);
  assert.match(registrationSource, /Birthdate/);
  assert.match(registrationSource, /MonthCalendar/);
  assert.match(registrationSource, /showMonthYearPicker/);
  assert.match(registrationSource, /Years of Experience/);
  assert.match(appSource, /validateProviderSignupRequirements/);
  assert.match(appSource, /signupBirthdate/);
  assert.match(appSource, /buildProviderServiceDescription/);
  assert.match(domainSource, /providerSignupRequirements/);
  assert.match(domainSource, /Providers must be at least 18 years old/);
  assert.match(domainSource, /Government ID upload after account creation/);
});

test('signup registration is split into focused steps', () => {
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/auth/views/AuthScreens.tsx'),
    'utf8',
  );
  const registrationSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthRegistrationScreen.tsx'),
    'utf8',
  );

  assert.match(viewSource, /AuthRegistrationScreen/);
  assert.match(registrationSource, /SignupProgress/);
  assert.match(registrationSource, /SignupStepHeader/);
  assert.match(registrationSource, /\['Account', 'Eligibility', 'Service'\]/);
  assert.match(registrationSource, /\['Account', 'Address'\]/);
  assert.match(registrationSource, /ProviderEligibilityStep/);
  assert.match(registrationSource, /ProviderServiceStep/);
  assert.match(registrationSource, /SignupStepActions/);
});

test('auth surface is split into focused auth components', () => {
  const viewSource = readFileSync(
    join(process.cwd(), 'src/features/auth/views/AuthScreens.tsx'),
    'utf8',
  );
  const componentIndexSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/index.ts'),
    'utf8',
  );

  assert.match(viewSource, /AuthGate/);
  assert.match(viewSource, /AuthRoleChoiceScreen/);
  assert.match(viewSource, /AuthLoginScreen/);
  assert.match(viewSource, /AuthRegistrationScreen/);
  assert.match(componentIndexSource, /AuthGate/);
  assert.match(componentIndexSource, /AuthLoginScreen/);
  assert.match(componentIndexSource, /AuthRegistrationScreen/);
  assert.match(componentIndexSource, /AuthRoleChoiceScreen/);
});

test('role choice screen uses the redesigned selectable role flow', () => {
  const roleChoiceSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthRoleChoiceScreen.tsx'),
    'utf8',
  );

  assert.match(roleChoiceSource, /Choose your role/);
  assert.match(roleChoiceSource, /Tell us how you want to use ServEase/);
  assert.match(roleChoiceSource, /useState<AppRole>\('customer'\)/);
  assert.match(roleChoiceSource, /accessibilityRole="radiogroup"/);
  assert.match(roleChoiceSource, /accessibilityRole="radio"/);
  assert.match(roleChoiceSource, /Continue/);
  assert.match(roleChoiceSource, /I already have an account/);
  assert.match(roleChoiceSource, /authReferenceDecorativePlate/);
  assert.match(roleChoiceSource, /authReferenceBrandMark/);
  assert.match(roleChoiceSource, /customerRegistration/);
  assert.match(roleChoiceSource, /providerRegistration/);
  assert.match(roleChoiceSource, /customerLogin/);
  assert.match(roleChoiceSource, /providerLogin/);
});

test('login screen uses the redesigned full-bleed auth surface', () => {
  const loginSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthLoginScreen.tsx'),
    'utf8',
  );
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

  assert.match(loginSource, /Welcome back/);
  assert.match(loginSource, /authReferenceDecorativePlate/);
  assert.match(loginSource, /authReferenceBrandMark/);
  assert.match(loginSource, /Customer account/);
  assert.match(loginSource, /Provider workspace/);
  assert.match(loginSource, /Email address/);
  assert.match(loginSource, /Password/);
  assert.match(loginSource, /Forgot password/);
  assert.match(loginSource, /Continue with Google/);
  assert.match(loginSource, /Create an account/);
  assert.match(appSource, /customerLogin/);
  assert.match(appSource, /providerLogin/);
  assert.match(appSource, /statusBarStyle=\{isAuthReferenceScreen \? 'dark' : undefined\}/);
});

test('auth gate matches the ServEase reference entry flow with a decorative plate and native UI', () => {
  const gateSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthGate.tsx'),
    'utf8',
  );
  const assetManifestSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/authGateAssets.ts'),
    'utf8',
  );
  const assetNotes = readFileSync(
    join(process.cwd(), 'assets/auth/README.md'),
    'utf8',
  );

  assert.match(gateSource, /auth-gate-reference-plate/);
  assert.match(gateSource, /authReferenceDecorativePlate/);
  assert.match(gateSource, /resizeMode="cover"/);
  assert.doesNotMatch(gateSource, /resizeMode="stretch"/);
  assert.doesNotMatch(gateSource, /auth-gate-layered-assets/);
  assert.match(assetManifestSource, /auth-reference-decorative-plate\.png/);
  assert.match(assetManifestSource, /auth-tool-pliers\.png/);
  assert.match(assetManifestSource, /auth-tool-brush\.png/);
  assert.match(assetManifestSource, /auth-paint-stroke\.png/);
  assert.doesNotMatch(assetManifestSource, /auth-tool-brush-paint\.png/);
  assert.match(assetManifestSource, /auth-tool-broom\.png/);
  assert.match(assetManifestSource, /auth-tool-wrench-faucet\.png/);
  assert.match(gateSource, /buildAuthGatePlateStyle/);
  assert.match(gateSource, /AuthGateBrandMark/);
  assert.match(gateSource, /AuthGateWordmark/);
  assert.match(gateSource, /authReferenceBrandMark/);
  assert.match(gateSource, /authReferenceWordmark/);
  assert.doesNotMatch(gateSource, /react-native-svg/);
  assert.doesNotMatch(gateSource, /Cog/);
  assert.match(gateSource, /accessibilityLabel="ServEase"/);
  assert.match(gateSource, /Sign up for ServEase/);
  assert.match(gateSource, /Finding and connecting with trusted local professionals around you/);
  assert.match(gateSource, /Quality work\. Trusted professionals/);
  assert.match(gateSource, /navigate\('signupRole', null\)/);
  assert.match(gateSource, /navigate\('loginRole', null\)/);
  assert.match(assetManifestSource, /auth-brand-mark\.png/);
  assert.match(assetManifestSource, /auth-wordmark\.png/);
  assert.match(assetNotes, /Generated with the built-in image generation workflow/);
  assert.match(assetNotes, /auth-brand-mark\.png and auth-wordmark\.png/);
  assert.match(assetNotes, /auth-reference-decorative-plate\.png/);
  assert.match(assetNotes, /Center safe area/);
  assert.match(assetNotes, /decorative only/);
});
