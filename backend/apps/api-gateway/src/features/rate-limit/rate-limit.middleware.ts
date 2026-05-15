import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const defaultWindowMs = 60_000;
const defaultMaxRequests = 120;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(private readonly configService: ConfigService) {
    this.windowMs = this.readPositiveNumber(
      'API_GATEWAY_RATE_LIMIT_WINDOW_MS',
      defaultWindowMs,
    );
    this.maxRequests = this.readPositiveNumber(
      'API_GATEWAY_RATE_LIMIT_MAX',
      defaultMaxRequests,
    );
  }

  use(request: Request, response: Response, next: NextFunction): void {
    if (this.isHealthCheck(request)) {
      next();
      return;
    }

    const now = Date.now();
    const key = this.clientKey(request);
    const existing = this.buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : {
            count: 0,
            resetAt: now + this.windowMs,
          };

    if (bucket.count >= this.maxRequests) {
      response.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      response.status(429).json({
        error: {
          code: 'rate_limited',
          message: 'Too many requests.',
          details: {},
        },
      });
      return;
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);
    next();
  }

  private readPositiveNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string | number>(key, fallback));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  private isHealthCheck(request: Request): boolean {
    return (request.path || request.url || '').startsWith('/health');
  }

  private clientKey(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0]?.split(',')[0]?.trim() || 'unknown';
    }

    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return request.socket.remoteAddress ?? 'unknown';
  }
}
