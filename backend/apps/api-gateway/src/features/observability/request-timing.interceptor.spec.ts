import { ExecutionContext, HttpException } from '@nestjs/common';
import { CallHandler } from '@nestjs/common/interfaces';
import { Observable, lastValueFrom, of, throwError } from 'rxjs';
import { RequestTimingInterceptor } from './request-timing.interceptor';

describe('RequestTimingInterceptor', () => {
  let interceptor: RequestTimingInterceptor;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new RequestTimingInterceptor();
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  it('writes structured timing output for selected mobile gateway routes', async () => {
    const context = createContext({
      method: 'GET',
      originalUrl: '/v1/catalog/categories',
      statusCode: 200,
      headers: {
        'x-correlation-id': 'correlation-1',
        traceparent: 'traceparent-1',
      },
      requestId: 'request-1',
    });
    const callHandler = createCallHandler(of({ data: [] }));

    await lastValueFrom(interceptor.intercept(context, callHandler));

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const entry = readLoggedEntry();
    expect(entry).toMatchObject({
      level: 'info',
      event: 'api_gateway_request_timing',
      method: 'GET',
      route: 'GET /v1/catalog/categories',
      path: '/v1/catalog/categories',
      statusCode: 200,
      correlationId: 'correlation-1',
      traceId: 'traceparent-1',
      requestId: 'request-1',
    });
    expect(entry.durationMs).toEqual(expect.any(Number));
  });

  it('writes error timing output with the thrown HTTP status', async () => {
    const context = createContext({
      method: 'GET',
      originalUrl:
        '/v1/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc?scope=provider',
      statusCode: 200,
    });
    const error = new HttpException('Forbidden', 403);
    const callHandler = createCallHandler(throwError(() => error));

    await expect(
      lastValueFrom(interceptor.intercept(context, callHandler)),
    ).rejects.toBe(error);

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const entry = readLoggedEntry();
    expect(entry).toMatchObject({
      level: 'error',
      event: 'api_gateway_request_timing',
      method: 'GET',
      route: 'GET /v1/bookings/:id',
      path: '/v1/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc?scope=provider',
      statusCode: 403,
    });
  });

  it('skips non-mobile routes and booking tracking streams', async () => {
    const healthContext = createContext({
      method: 'GET',
      originalUrl: '/health/live',
      statusCode: 200,
    });
    const streamContext = createContext({
      method: 'GET',
      originalUrl:
        '/v1/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/tracking/stream',
      statusCode: 200,
    });
    const callHandler = createCallHandler(of({ data: [] }));

    await lastValueFrom(interceptor.intercept(healthContext, callHandler));
    await lastValueFrom(interceptor.intercept(streamContext, callHandler));

    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  function readLoggedEntry(): Record<string, unknown> {
    const rawLog = stdoutSpy.mock.calls.at(-1)?.[0];
    expect(typeof rawLog).toBe('string');
    return JSON.parse(String(rawLog).trim()) as Record<string, unknown>;
  }
});

function createContext({
  method,
  originalUrl,
  statusCode,
  headers = {},
  requestId,
}: {
  method: string;
  originalUrl: string;
  statusCode: number;
  headers?: Record<string, string>;
  requestId?: string;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        id: requestId,
        method,
        originalUrl,
        url: originalUrl,
      }),
      getResponse: () => ({
        statusCode,
      }),
    }),
  } as unknown as ExecutionContext;
}

function createCallHandler(observable: Observable<unknown>): CallHandler {
  return {
    handle: () => observable,
  };
}
