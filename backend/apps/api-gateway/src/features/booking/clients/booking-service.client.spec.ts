import { ConfigService } from '@nestjs/config';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from '../booking.errors';
import { BookingServiceClient } from './booking-service.client';

describe('BookingServiceClient', () => {
  it('maps booking service invalid transition responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'invalid_booking_transition',
          message: 'Booking status transition is invalid.',
          details: {},
        },
      },
      async () => {
        const client = new BookingServiceClient(configService());

        await expect(
          client.transitionStatus(
            '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
            'pending',
            'completed',
          ),
        ).rejects.toBeInstanceOf(InvalidBookingTransitionError);
      },
    );
  });

  it('maps booking service not found responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'booking_not_found',
          message: 'Booking was not found.',
          details: {},
        },
      },
      async () => {
        const client = new BookingServiceClient(configService());

        await expect(
          client.transitionStatus(
            '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
            'pending',
            'confirmed',
          ),
        ).rejects.toBeInstanceOf(BookingNotFoundError);
      },
    );
  });

  it('maps booking detail not found responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'booking_not_found',
          message: 'Booking was not found.',
          details: {},
        },
      },
      async () => {
        const client = new BookingServiceClient(configService());

        await expect(
          client.findBooking(
            '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
            null,
          ),
        ).rejects.toBeInstanceOf(BookingNotFoundError);
      },
    );
  });

  it('maps booking service provider unavailable responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'provider_unavailable',
          message: 'Provider is unavailable for the requested time.',
          details: {},
        },
      },
      async () => {
        const client = new BookingServiceClient(configService());

        await expect(
          client.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
            providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            serviceAddress: '123 Test St',
            scheduledAt: '2026-05-20T08:00:00.000Z',
          }),
        ).rejects.toBeInstanceOf(ProviderUnavailableError);
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
    get: jest.fn().mockReturnValue('http://booking-service.test'),
  } as unknown as ConfigService;
}
