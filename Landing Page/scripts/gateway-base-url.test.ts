import assert from 'node:assert/strict';
import {
  getServerGatewayBaseUrl,
  resolvePublicGatewayBaseUrl,
} from '../src/app/lib/gateway-base-url';

assert.equal(getServerGatewayBaseUrl(undefined, 'development'), 'http://localhost:5001');
assert.equal(
  getServerGatewayBaseUrl('https://api.servease.test/', 'production'),
  'https://api.servease.test',
);
assert.throws(
  () => getServerGatewayBaseUrl('', 'production'),
  /SERVEASE_API_BASE_URL is required in production/,
);
assert.throws(
  () => resolvePublicGatewayBaseUrl('', 'production'),
  /NEXT_PUBLIC_API_BASE_URL is required in production/,
);
