export interface GatewayCorsRuntimeEnv {
  API_GATEWAY_CORS_ORIGIN?: string;
  API_GATEWAY_CORS_ORIGINS?: string;
  NODE_ENV?: string;
}

const LOCAL_DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3100',
  'http://localhost:3101',
  'http://localhost:3102',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:19006',
];

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
    if (env.NODE_ENV === 'production') {
      return configuredOrigins;
    }

    return [...new Set([...configuredOrigins, ...LOCAL_DEVELOPMENT_ORIGINS])];
  }

  if (env.NODE_ENV === 'production') {
    return [];
  }

  return LOCAL_DEVELOPMENT_ORIGINS;
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
