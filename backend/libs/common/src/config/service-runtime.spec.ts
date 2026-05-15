import { resolveServicePort } from './service-runtime';

describe('resolveServicePort', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses the configured environment variable when present', () => {
    process.env.AUTH_SERVICE_PORT = '8501';

    expect(
      resolveServicePort({
        name: 'auth-service',
        defaultPort: 9000,
        portEnv: 'AUTH_SERVICE_PORT',
      }),
    ).toBe(8501);
  });

  it('falls back to the default port', () => {
    delete process.env.AUTH_SERVICE_PORT;

    expect(
      resolveServicePort({
        name: 'auth-service',
        defaultPort: 8501,
        portEnv: 'AUTH_SERVICE_PORT',
      }),
    ).toBe(8501);
  });

  it('rejects invalid ports', () => {
    process.env.AUTH_SERVICE_PORT = 'invalid';

    expect(() =>
      resolveServicePort({
        name: 'auth-service',
        defaultPort: 8501,
        portEnv: 'AUTH_SERVICE_PORT',
      }),
    ).toThrow('auth-service received an invalid port: invalid');
  });
});
