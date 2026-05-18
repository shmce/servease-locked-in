const LOCAL_GATEWAY_BASE_URL = 'http://localhost:5001';

export function resolveGatewayBaseUrl(
  configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL,
  nodeEnv = process.env.NODE_ENV,
): string {
  const normalized = configuredBaseUrl?.trim().replace(/\/$/, '');
  if (normalized) {
    return normalized;
  }

  if (nodeEnv === 'production') {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required in production.');
  }

  return LOCAL_GATEWAY_BASE_URL;
}
