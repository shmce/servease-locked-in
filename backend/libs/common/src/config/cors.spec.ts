import {
  createGatewayCorsOptions,
  resolveGatewayCorsOrigins,
} from './cors';

describe('gateway CORS config', () => {
  it('uses configured comma-separated origins', () => {
    expect(
      resolveGatewayCorsOrigins({
        API_GATEWAY_CORS_ORIGINS:
          'https://app.servease.test, http://localhost:8082 ',
        NODE_ENV: 'production',
      }),
    ).toEqual(['https://app.servease.test', 'http://localhost:8082']);
  });

  it('supplements configured local origins during development', () => {
    expect(
      resolveGatewayCorsOrigins({
        API_GATEWAY_CORS_ORIGINS: 'http://localhost:8082',
        NODE_ENV: 'development',
      }),
    ).toEqual(
      expect.arrayContaining([
        'http://localhost:8082',
        'http://localhost:3000',
        'http://localhost:3102',
      ]),
    );
  });

  it('supports wildcard origins when explicitly configured', () => {
    expect(
      resolveGatewayCorsOrigins({
        API_GATEWAY_CORS_ORIGIN: '*',
        NODE_ENV: 'production',
      }),
    ).toBe(true);
  });

  it('keeps production CORS closed without explicit origins', () => {
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'production' })).toEqual([]);
  });

  it('allows local web app origins outside production', () => {
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:3000',
    );
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:3001',
    );
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:3102',
    );
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:8082',
    );
    expect(resolveGatewayCorsOrigins({ NODE_ENV: 'development' })).toContain(
      'http://localhost:8084',
    );
  });

  it('allows auth and json headers on gateway requests', () => {
    expect(createGatewayCorsOptions({ NODE_ENV: 'development' })).toMatchObject({
      credentials: true,
      allowedHeaders: ['authorization', 'content-type', 'accept'],
    });
  });
});
