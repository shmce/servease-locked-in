import { ConfigService } from '@nestjs/config';
import {
  BookingNotFoundError,
  InvalidBookingRequestError,
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

  it('maps booking service invalid request responses to the gateway domain error', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'invalid_booking_request',
          message: 'Booking request is invalid.',
          details: {},
        },
      },
      async () => {
        const client = new BookingServiceClient(configService());

        await expect(
          client.updateLiveLocation(
            '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            {
              latitude: 999,
              longitude: 120.9842,
            },
          ),
        ).rejects.toBeInstanceOf(InvalidBookingRequestError);
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

  it('sends booking service update requests to the booking service', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'update-1',
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          actorId: 'provider-user-1',
          updateType: 'progress',
          message: 'Halfway done.',
          checklist: null,
          attachmentId: null,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new BookingServiceClient(configService());
      await client.createServiceUpdate(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        {
          actorId: 'provider-user-1',
          providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          updateType: 'progress',
          message: 'Halfway done.',
        },
      );
      await client.listServiceUpdates(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        null,
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );
      await client.listTimelineEvents(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        null,
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );
      await client.getTrackingSnapshot(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        null,
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      );
      await client.deleteAttachment(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'attachment-1',
        'provider-user-1',
      );
      await client.raiseDispute('0ec2c525-63e0-4a39-9f81-60b8585f45dc', {
        actorId: 'provider-user-1',
        category: 'damage',
        reason: 'Incorrect work',
      });

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/service-updates',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            actorId: 'provider-user-1',
            providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            updateType: 'progress',
            message: 'Halfway done.',
          }),
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/service-updates?providerId=b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          },
          body: undefined,
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/timeline?providerId=b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          },
          body: undefined,
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/tracking?providerId=b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          },
          body: undefined,
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        5,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/attachments/attachment-1',
        {
          method: 'DELETE',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            actorId: 'provider-user-1',
          }),
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        6,
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/disputes',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            actorId: 'provider-user-1',
            category: 'damage',
            reason: 'Incorrect work',
          }),
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });

  it('sends provider live location updates to the booking service', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracyMeters: 8,
          updatedAt: '2026-05-16T00:00:05.000Z',
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new BookingServiceClient(configService());
      await expect(
        client.updateLiveLocation(
          '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          {
            latitude: 14.5995,
            longitude: 120.9842,
            accuracyMeters: 8,
          },
        ),
      ).resolves.toEqual({
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
        updatedAt: '2026-05-16T00:00:05.000Z',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://booking-service.test/internal/bookings/0ec2c525-63e0-4a39-9f81-60b8585f45dc/tracking/location',
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            latitude: 14.5995,
            longitude: 120.9842,
            accuracyMeters: 8,
          }),
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
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
