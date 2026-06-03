import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const contextSource = readFileSync(
  join(process.cwd(), 'src/provider-app/context/ProviderDataContext.tsx'),
  'utf8',
);
const editProfileSource = readFileSync(
  join(process.cwd(), 'src/provider-app/components/EditProfilePage.tsx'),
  'utf8',
);

assert.match(contextSource, /updateCurrentUserProfile/);
assert.match(contextSource, /updateProfile: \(updates: Partial<ProviderProfile>\) => Promise<void>/);
assert.match(contextSource, /providerProfileFromCurrentUser/);
assert.match(editProfileSource, /await updateProfile\(\{/);
assert.doesNotMatch(editProfileSource, /updateCurrentUserProfile/);
