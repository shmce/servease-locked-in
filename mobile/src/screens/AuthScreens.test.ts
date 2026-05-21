import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('auth screens use APICenter Google and OTP handlers instead of placeholders', () => {
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
  assert.match(viewModelSource, /requestPhoneOtp/);
  assert.match(viewModelSource, /verifyPhoneOtp/);
  assert.match(viewSource, /Phone Verification/);
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
  assert.match(viewSource, /Years of Experience/);
  assert.match(appSource, /validateProviderSignupRequirements/);
  assert.match(appSource, /buildProviderServiceDescription/);
  assert.match(domainSource, /providerSignupRequirements/);
  assert.match(domainSource, /Government ID upload after account creation/);
});
