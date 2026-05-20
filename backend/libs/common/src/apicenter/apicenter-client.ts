import { TribeClient, type TribeClientOptions } from '@implementsprint/sdk';

export interface ApicenterRuntimeEnv {
  APICENTER_URL?: string;
  APICENTER_TRIBE_ID?: string;
  APICENTER_SERVICE_ID?: string;
  APICENTER_TRIBE_SECRET?: string;
}

export class ApicenterConfigurationError extends Error {
  constructor() {
    super('apicenter_not_configured');
  }
}

export function createApicenterClient(
  env: ApicenterRuntimeEnv = process.env,
  options: Partial<
    Pick<TribeClientOptions, 'timeout' | 'maxRetries' | 'retryBaseDelayMs'>
  > = {},
): TribeClient {
  const gatewayUrl = env.APICENTER_URL?.trim().replace(/\/$/, '') ?? '';
  const tribeId = env.APICENTER_TRIBE_ID?.trim() ?? '';
  const sourceServiceId = env.APICENTER_SERVICE_ID?.trim() || undefined;
  const secret = env.APICENTER_TRIBE_SECRET?.trim() ?? '';

  if (!gatewayUrl || !tribeId || !secret) {
    throw new ApicenterConfigurationError();
  }

  return new TribeClient({
    gatewayUrl,
    tribeId,
    ...(sourceServiceId ? { sourceServiceId } : {}),
    secret,
    ...options,
  });
}
