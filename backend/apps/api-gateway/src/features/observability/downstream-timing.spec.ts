import { timedGatewayFetch } from './downstream-timing';

describe('timedGatewayFetch', () => {
  let originalFetch: typeof fetch;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    stdoutSpy.mockRestore();
  });

  it('writes downstream timing for a successful service call', async () => {
    const response = {
      ok: true,
      status: 200,
    } as Response;
    const fetchMock = jest.fn().mockResolvedValue(response);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      timedGatewayFetch({
        method: 'GET',
        operation: '/internal/catalog/categories',
        service: 'catalog-service',
        url: 'http://catalog-service.test/internal/catalog/categories',
      }),
    ).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://catalog-service.test/internal/catalog/categories',
    );
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(readLoggedEntry()).toMatchObject({
      event: 'api_gateway_downstream_timing',
      level: 'info',
      method: 'GET',
      operation: '/internal/catalog/categories',
      path: '/internal/catalog/categories',
      service: 'catalog-service',
      statusCode: 200,
    });
  });

  it('writes downstream timing before rethrowing network failures', async () => {
    const error = new Error('Connection refused');
    globalThis.fetch = jest.fn().mockRejectedValue(error) as unknown as typeof fetch;

    await expect(
      timedGatewayFetch(
        {
          method: 'POST',
          operation: '/internal/bookings',
          service: 'booking-service',
          url: 'http://booking-service.test/internal/bookings',
        },
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({}),
        },
      ),
    ).rejects.toBe(error);

    expect(readLoggedEntry()).toMatchObject({
      event: 'api_gateway_downstream_timing',
      errorName: 'Error',
      level: 'error',
      method: 'POST',
      operation: '/internal/bookings',
      path: '/internal/bookings',
      service: 'booking-service',
      statusCode: null,
    });
  });

  function readLoggedEntry(): Record<string, unknown> {
    const rawLog = stdoutSpy.mock.calls.at(-1)?.[0];
    expect(typeof rawLog).toBe('string');
    return JSON.parse(String(rawLog).trim()) as Record<string, unknown>;
  }
});
