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
  const appSource = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
  const domainSource = readFileSync(
    join(process.cwd(), 'src/domain/providerRegistration.ts'),
    'utf8',
  );

  assert.match(viewSource, /Required for admin approval/);
  assert.match(viewSource, /Birthdate/);
  assert.match(viewSource, /MonthCalendar/);
  assert.match(viewSource, /showMonthYearPicker/);
  assert.match(viewSource, /Years of Experience/);
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

  assert.match(viewSource, /SignupProgress/);
  assert.match(viewSource, /SignupStepHeader/);
  assert.match(viewSource, /\['Account', 'Eligibility', 'Service'\]/);
  assert.match(viewSource, /\['Account', 'Address'\]/);
  assert.match(viewSource, /ProviderEligibilityStep/);
  assert.match(viewSource, /ProviderServiceStep/);
  assert.match(viewSource, /SignupStepActions/);
});
