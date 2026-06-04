import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { performance } from 'node:perf_hooks';
import { Observable, catchError, tap, throwError } from 'rxjs';

const MOBILE_ROUTE_PREFIXES = [
  '/v1/me',
  '/v1/catalog',
  '/v1/bookings',
  '/v1/notifications',
  '/v1/provider',
  '/v1/geo',
  '/v1/pricing',
];

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

type TimingRequest = Request & {
  id?: string;
};

type TimingLogEntry = {
  level: 'error' | 'info';
  event: 'api_gateway_request_timing';
  method: string;
  route: string;
  path: string;
  statusCode: number;
  durationMs: number;
  correlationId: string | null;
  traceId: string | null;
  requestId: string | null;
};

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<TimingRequest>();
    const response = httpContext.getResponse<Response>();
    const path = resolveRequestPath(request);

    if (!shouldTimeRequest(path)) {
      return next.handle();
    }

    const startedAt = performance.now();

    return next.handle().pipe(
      tap(() => {
        this.writeTimingLog({
          request,
          path,
          statusCode: resolveStatusCode(undefined, response.statusCode),
          startedAt,
        });
      }),
      catchError((error: unknown) => {
        this.writeTimingLog({
          request,
          path,
          statusCode: resolveStatusCode(error, response.statusCode),
          startedAt,
          isError: true,
        });
        return throwError(() => error);
      }),
    );
  }

  private writeTimingLog({
    request,
    path,
    statusCode,
    startedAt,
    isError = false,
  }: {
    request: TimingRequest;
    path: string;
    statusCode: number;
    startedAt: number;
    isError?: boolean;
  }): void {
    const method = request.method ?? 'UNKNOWN';
    const entry: TimingLogEntry = {
      level: isError || statusCode >= 500 ? 'error' : 'info',
      event: 'api_gateway_request_timing',
      method,
      route: `${method} ${normalizeRoutePath(path)}`,
      path,
      statusCode,
      durationMs: roundDuration(performance.now() - startedAt),
      correlationId: firstHeader(request, 'x-correlation-id', 'x-request-id'),
      traceId: firstHeader(request, 'traceparent'),
      requestId: request.id ?? null,
    };

    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }
}

function shouldTimeRequest(path: string): boolean {
  const pathname = stripQuery(path);
  if (pathname.endsWith('/tracking/stream')) {
    return false;
  }

  return MOBILE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function resolveRequestPath(request: TimingRequest): string {
  return request.originalUrl ?? request.url ?? '';
}

function normalizeRoutePath(path: string): string {
  return stripQuery(path).replace(UUID_PATTERN, ':id');
}

function stripQuery(path: string): string {
  return path.split('?')[0] || '/';
}

function resolveStatusCode(error: unknown, fallback?: number): number {
  const candidate = error as { getStatus?: () => number };
  if (typeof candidate?.getStatus === 'function') {
    return candidate.getStatus();
  }

  return Number.isInteger(fallback) && Number(fallback) > 0
    ? Number(fallback)
    : 500;
}

function firstHeader(
  request: TimingRequest,
  ...names: string[]
): string | null {
  for (const name of names) {
    const value = request.headers?.[name];
    if (Array.isArray(value)) {
      const firstValue = value.find((item) => item.trim().length > 0);
      if (firstValue) {
        return firstValue;
      }
    } else if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function roundDuration(value: number): number {
  return Math.round(value * 100) / 100;
}
