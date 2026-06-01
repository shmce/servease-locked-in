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

test('auth gate matches the ServEase reference entry flow with generated assets', () => {
  const gateSource = readFileSync(
    join(process.cwd(), 'src/features/auth/components/AuthGate.tsx'),
    'utf8',
  );
  const assetNotes = readFileSync(
    join(process.cwd(), 'assets/auth/README.md'),
    'utf8',
  );

  assert.match(gateSource, /auth-reference-frame-v2\.png/);
  assert.match(gateSource, /authGateLogoText/);
  assert.match(gateSource, /Sign up for ServEase/);
  assert.match(gateSource, /Finding and connecting with trusted local professionals around you/);
  assert.match(gateSource, /Quality work\. Trusted professionals/);
  assert.match(gateSource, /navigate\('signupRole', null\)/);
  assert.match(gateSource, /navigate\('loginRole', null\)/);
  assert.match(assetNotes, /Generated with the built-in image generation workflow/);
  assert.match(assetNotes, /decorative only/);
});
