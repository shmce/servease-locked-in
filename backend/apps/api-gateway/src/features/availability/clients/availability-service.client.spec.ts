import { ConfigService } from '@nestjs/config';
import { InvalidAvailabilityRequestError } from '../availability.errors';
import { AvailabilityServiceClient } from './availability-service.client';

describe('AvailabilityServiceClient', () => {
  it('maps invalid request responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'invalid_availability_request',
          message: 'Availability request is invalid.',
          details: {},
        },
      },
      async () => {
        const client = new AvailabilityServiceClient(configService());

        await expect(
          client.replaceWindows('f87b3f7e-6b54-4cef-852f-854983780c7b', []),
        ).rejects.toBeInstanceOf(InvalidAvailabilityRequestError);
      },
    );
  });
});

async function withFetchResponse(
  payload: unknown,
  action: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: jest.fn().mockResolvedValue(payload),
  }) as unknown as typeof fetch;

  try {
    await action();
  } finally {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  }
}

function configService(): ConfigService {
  return {
    get: jest.fn().mockReturnValue('http://availability-service.test'),
  } as unknown as ConfigService;
}
