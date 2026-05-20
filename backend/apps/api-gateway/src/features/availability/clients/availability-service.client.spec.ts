import { ConfigService } from '@nestjs/config';
import {
  InvalidAvailabilityRequestError,
  TimeOffConflictsBookingError,
  TimeOffTooSoonError,
} from '../availability.errors';
import { AvailabilityServiceClient } from './availability-service.client';

describe('AvailabilityServiceClient', () => {
  it('loads provider availability from the availability service', async () => {
    const fetchMock = await withFetchResponse(
      {
        data: {
          providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
          windows: [],
          daysOff: [],
          timeOffWindows: [],
        },
      },
      true,
      async () => {
        const client = new AvailabilityServiceClient(configService());

        await expect(
          client.getSchedule('f87b3f7e-6b54-4cef-852f-854983780c7b'),
        ).resolves.toEqual({
          providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
          windows: [],
          daysOff: [],
          timeOffWindows: [],
        });
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://availability-service.test/internal/providers/f87b3f7e-6b54-4cef-852f-854983780c7b/availability',
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
        body: undefined,
      },
    );
  });

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

  it('adds and removes partial time-off windows through the availability service', async () => {
    const fetchMock = await withFetchResponse(
      {
        data: {
          providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
          windows: [],
          daysOff: [],
          timeOffWindows: [],
        },
      },
      true,
      async () => {
        const client = new AvailabilityServiceClient(configService());

        await client.addTimeOffWindow(
          'f87b3f7e-6b54-4cef-852f-854983780c7b',
          {
            offDate: '2026-05-24',
            startTime: '14:00',
            endTime: '17:00',
            reason: 'Personal errand',
          },
        );
        await client.removeTimeOffWindow(
          'f87b3f7e-6b54-4cef-852f-854983780c7b',
          'e4084ee1-8db7-4890-8c95-cd92725bd20a',
        );
      },
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://availability-service.test/internal/providers/f87b3f7e-6b54-4cef-852f-854983780c7b/availability/time-off',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          offDate: '2026-05-24',
          startTime: '14:00',
          endTime: '17:00',
          reason: 'Personal errand',
        }),
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://availability-service.test/internal/providers/f87b3f7e-6b54-4cef-852f-854983780c7b/availability/time-off/e4084ee1-8db7-4890-8c95-cd92725bd20a',
      {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: undefined,
      },
    );
  });

  it('maps time-off business errors to gateway domain errors', async () => {
    await withFetchResponse(
      {
        error: {
          code: 'time_off_too_soon',
          message: 'Too soon.',
          details: {},
        },
      },
      async () => {
        const client = new AvailabilityServiceClient(configService());

        await expect(
          client.addTimeOffWindow('f87b3f7e-6b54-4cef-852f-854983780c7b', {
            offDate: '2026-05-21',
            startTime: '14:00',
            endTime: '17:00',
            reason: null,
          }),
        ).rejects.toBeInstanceOf(TimeOffTooSoonError);
      },
    );

    await withFetchResponse(
      {
        error: {
          code: 'time_off_conflicts_booking',
          message: 'Conflicts.',
          details: {},
        },
      },
      async () => {
        const client = new AvailabilityServiceClient(configService());

        await expect(
          client.addTimeOffWindow('f87b3f7e-6b54-4cef-852f-854983780c7b', {
            offDate: '2026-05-24',
            startTime: '14:00',
            endTime: '17:00',
            reason: null,
          }),
        ).rejects.toBeInstanceOf(TimeOffConflictsBookingError);
      },
    );
  });
});

async function withFetchResponse(
  payload: unknown,
  okOrAction: boolean | (() => Promise<void>),
  maybeAction?: () => Promise<void>,
): Promise<jest.MockedFunction<typeof fetch>> {
  const ok = typeof okOrAction === 'boolean' ? okOrAction : false;
  const action = typeof okOrAction === 'function' ? okOrAction : maybeAction;
  if (!action) {
    throw new Error('Missing action for fetch response helper.');
  }

  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(payload),
  }) as unknown as jest.MockedFunction<typeof fetch>;
  globalThis.fetch = fetchMock;

  try {
    await action();
    return fetchMock;
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
