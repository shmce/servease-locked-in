import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('auth screens use APICenter Google and OTP handlers instead of placeholders', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/screens/AuthScreens.tsx'),
    'utf8',
  );

  assert.match(source, /startGoogleSignIn/);
  assert.match(source, /requestPhoneOtp/);
  assert.match(source, /verifyPhoneOtp/);
  assert.match(source, /Phone Verification/);
  assert.doesNotMatch(source, /needs native auth setup before enabling/);
  assert.doesNotMatch(source, /needs OTP backend support before enabling/);
});
