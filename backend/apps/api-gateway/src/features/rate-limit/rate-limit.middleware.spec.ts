import { ConfigService } from '@nestjs/config';
import { RateLimitMiddleware } from './rate-limit.middleware';

interface MockResponse {
  setHeader: jest.Mock;
  status: jest.Mock;
  json: jest.Mock;
}

describe('RateLimitMiddleware', () => {
  it('rejects requests after the configured limit for the same client', () => {
    const middleware = new RateLimitMiddleware(
      configService({
        API_GATEWAY_RATE_LIMIT_MAX: '2',
        API_GATEWAY_RATE_LIMIT_WINDOW_MS: '60000',
      }),
    );
    const firstNext = jest.fn();
    const secondNext = jest.fn();
    const thirdNext = jest.fn();
    const response = responseMock();

    middleware.use(requestMock('203.0.113.1'), response as never, firstNext);
    middleware.use(requestMock('203.0.113.1'), response as never, secondNext);
    middleware.use(requestMock('203.0.113.1'), response as never, thirdNext);

    expect(firstNext).toHaveBeenCalledTimes(1);
    expect(secondNext).toHaveBeenCalledTimes(1);
    expect(thirdNext).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(429);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'rate_limited',
        message: 'Too many requests.',
        details: {},
      },
    });
  });

  it('skips health checks', () => {
    const middleware = new RateLimitMiddleware(
      configService({
        API_GATEWAY_RATE_LIMIT_MAX: '0',
      }),
    );
    const next = jest.fn();
    const response = responseMock();

    middleware.use(
      { path: '/health/live', headers: {}, socket: {} } as never,
      response as never,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });
});

function configService(values: Record<string, string>): ConfigService {
  return {
    get: jest.fn((key: string, fallback?: string | number) => values[key] ?? fallback),
  } as unknown as ConfigService;
}

function requestMock(ip: string) {
  return {
    path: '/v1/catalog/categories',
    headers: {
      'x-forwarded-for': ip,
    },
    socket: {},
  } as never;
}

function responseMock(): MockResponse {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}
