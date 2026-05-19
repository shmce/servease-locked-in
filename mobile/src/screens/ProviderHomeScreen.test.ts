import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';

test('provider home is extracted from App into a dedicated screen without changing content', () => {
  const appSource = readFileSync(join(process.cwd(), 'App.tsx'), 'utf8');
  const screenPath = join(process.cwd(), 'src/screens/ProviderHomeScreen.tsx');

  assert.equal(existsSync(screenPath), true);

  const screenSource = readFileSync(screenPath, 'utf8');

  assert.match(appSource, /import \{ ProviderHomeScreen \} from '\.\/src\/screens\/ProviderHomeScreen';/);
  assert.match(appSource, /function renderProviderHome\(\)[\s\S]*<ProviderHomeScreen/);
  assert.match(screenSource, /export function ProviderHomeScreen/);
  assert.match(screenSource, /Available Payout/);
  assert.match(screenSource, /Active Bookings/);
  assert.match(screenSource, /My Services/);
  assert.match(screenSource, /Quick Actions/);
});
