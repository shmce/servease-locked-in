export interface GatewayCorsRuntimeEnv {
  API_GATEWAY_CORS_ORIGIN?: string;
  API_GATEWAY_CORS_ORIGINS?: string;
  NODE_ENV?: string;
}

export function resolveGatewayCorsOrigins(
  env: GatewayCorsRuntimeEnv = process.env,
): boolean | string[] {
  const rawOrigins =
    env.API_GATEWAY_CORS_ORIGINS ?? env.API_GATEWAY_CORS_ORIGIN ?? '';
  const configuredOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.includes('*')) {
    return true;
  }

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (env.NODE_ENV === 'production') {
    return [];
  }

  return [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:19006',
  ];
}

export function createGatewayCorsOptions(env: GatewayCorsRuntimeEnv = process.env) {
  return {
    origin: resolveGatewayCorsOrigins(env),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['authorization', 'content-type', 'accept'],
    maxAge: 600,
  };
}
