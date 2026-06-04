import { performance } from 'node:perf_hooks';

type DownstreamTimingInput = {
  service: string;
  operation: string;
  method: string;
  url: string;
};

export async function timedGatewayFetch(
  input: DownstreamTimingInput,
  init?: RequestInit,
): Promise<Response> {
  const startedAt = performance.now();
  const method = (init?.method ?? input.method).toUpperCase();

  try {
    const response =
      init === undefined ? await fetch(input.url) : await fetch(input.url, init);
    const statusCode =
      typeof response.status === 'number' ? response.status : null;
    writeDownstreamTiming({
      ...input,
      durationMs: elapsedMs(startedAt),
      method,
      statusCode,
    });
    return response;
  } catch (error) {
    writeDownstreamTiming({
      ...input,
      durationMs: elapsedMs(startedAt),
      errorName: error instanceof Error ? error.name : 'UnknownError',
      level: 'error',
      method,
      statusCode: null,
    });
    throw error;
  }
}

function elapsedMs(startedAt: number): number {
  return Number((performance.now() - startedAt).toFixed(2));
}

function writeDownstreamTiming(entry: {
  service: string;
  operation: string;
  method: string;
  url: string;
  durationMs: number;
  statusCode: number | null;
  errorName?: string;
  level?: 'error' | 'info';
}): void {
  process.stdout.write(
    `${JSON.stringify({
      level: entry.level ?? (entry.statusCode !== null && entry.statusCode >= 500
        ? 'error'
        : 'info'),
      event: 'api_gateway_downstream_timing',
      service: entry.service,
      operation: entry.operation,
      method: entry.method,
      path: pathFromUrl(entry.url),
      statusCode: entry.statusCode,
      durationMs: entry.durationMs,
      ...(entry.errorName ? { errorName: entry.errorName } : {}),
    })}\n`,
  );
}

function pathFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url;
  }
}
