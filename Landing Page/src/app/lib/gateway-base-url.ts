const LOCAL_GATEWAY_BASE_URL = 'http://localhost:5001';

function normalizeGatewayBaseUrl(value: string | undefined): string | null {
  const normalized = value?.trim().replace(/\/$/, '');
  return normalized || null;
}

export function getServerGatewayBaseUrl(
  configuredBaseUrl =
    process.env.SERVEASE_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL,
  nodeEnv = process.env.NODE_ENV,
): string {
  const normalized = normalizeGatewayBaseUrl(configuredBaseUrl);
  if (normalized) {
    return normalized;
  }

  if (nodeEnv === 'production') {
    throw new Error('SERVEASE_API_BASE_URL is required in production.');
  }

  return LOCAL_GATEWAY_BASE_URL;
}

export function resolvePublicGatewayBaseUrl(
  configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL,
  nodeEnv = process.env.NODE_ENV,
): string {
  const normalized = normalizeGatewayBaseUrl(configuredBaseUrl);
  if (normalized) {
    return normalized;
  }

  if (nodeEnv === 'production') {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is required in production.');
  }

  return LOCAL_GATEWAY_BASE_URL;
}
