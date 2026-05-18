import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveGatewayBaseUrl } from './gatewayConfig';

describe('resolveGatewayBaseUrl', () => {
  it('keeps localhost fallback outside production', () => {
    assert.equal(resolveGatewayBaseUrl(undefined, 'development'), 'http://localhost:5001');
  });

  it('fails fast in production when the public gateway URL is missing', () => {
    assert.throws(
      () => resolveGatewayBaseUrl('', 'production'),
      /EXPO_PUBLIC_API_BASE_URL is required in production/,
    );
  });

  it('normalizes a configured gateway URL', () => {
    assert.equal(
      resolveGatewayBaseUrl('https://api.servease.test/', 'production'),
      'https://api.servease.test',
    );
  });
});
