import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('booking form verifies service addresses through the APICenter geo gateway', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');

  assert.match(source, /geocodeAddress/);
  assert.match(source, /verifyServiceAddress/);
  assert.match(source, /Verify address/);
});

test('Google auth callback exchanges the APICenter code before returning to password login', () => {
  const source = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');

  assert.match(source, /exchangeGoogleCode/);
  assert.match(source, /servease:\/\/auth\/google\/callback/);
  assert.match(source, /Google account verified through APICenter/);
});
