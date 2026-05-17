import { PushDeliveryClient } from './push-delivery.client';

describe('PushDeliveryClient', () => {
  const originalFetch = global.fetch;
  const originalExpoPushApiUrl = process.env.EXPO_PUSH_API_URL;
  const originalExpoPushReceiptsApiUrl = process.env.EXPO_PUSH_RECEIPTS_API_URL;
  const originalExpoAccessToken = process.env.EXPO_ACCESS_TOKEN;
  const originalExpoPushMaxAttempts = process.env.EXPO_PUSH_MAX_ATTEMPTS;

  beforeEach(() => {
    process.env.EXPO_PUSH_API_URL = 'https://expo.test/push';
    process.env.EXPO_PUSH_RECEIPTS_API_URL = 'https://expo.test/receipts';
    delete process.env.EXPO_ACCESS_TOKEN;
    delete process.env.EXPO_PUSH_MAX_ATTEMPTS;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ status: 'ok', id: 'ticket-1' }],
      }),
    } as Response);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalExpoPushApiUrl === undefined) {
      delete process.env.EXPO_PUSH_API_URL;
    } else {
      process.env.EXPO_PUSH_API_URL = originalExpoPushApiUrl;
    }
    if (originalExpoAccessToken === undefined) {
      delete process.env.EXPO_ACCESS_TOKEN;
    } else {
      process.env.EXPO_ACCESS_TOKEN = originalExpoAccessToken;
    }
    if (originalExpoPushReceiptsApiUrl === undefined) {
      delete process.env.EXPO_PUSH_RECEIPTS_API_URL;
    } else {
      process.env.EXPO_PUSH_RECEIPTS_API_URL = originalExpoPushReceiptsApiUrl;
    }
    if (originalExpoPushMaxAttempts === undefined) {
      delete process.env.EXPO_PUSH_MAX_ATTEMPTS;
    } else {
      process.env.EXPO_PUSH_MAX_ATTEMPTS = originalExpoPushMaxAttempts;
    }
  });

  it('posts Expo push messages for supported registered devices', async () => {
    const client = new PushDeliveryClient();

    await expect(
      client.sendNotification(
        [
          {
            token: 'ExponentPushToken[abc]',
            platform: 'ios',
            deviceId: 'ios-device-1',
          },
          {
            token: 'native-apn-token',
            platform: 'ios',
            deviceId: 'ios-device-2',
          },
        ],
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking_update',
          title: 'Booking updated',
          body: 'Your booking changed.',
          isRead: false,
          metadata: { bookingId: 'booking-1' },
          createdAt: '2026-05-18T00:00:00.000Z',
        },
      ),
    ).resolves.toEqual({
      attempted: 1,
      delivered: 1,
      skipped: 1,
      invalidTokens: [],
      receiptChecks: [
        {
          ticketId: 'ticket-1',
          token: 'ExponentPushToken[abc]',
        },
      ],
    });

    expect(global.fetch).toHaveBeenCalledWith('https://expo.test/push', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          to: 'ExponentPushToken[abc]',
          title: 'Booking updated',
          body: 'Your booking changed.',
          sound: 'default',
          data: {
            notificationId: 'notification-1',
            type: 'booking_update',
            bookingId: 'booking-1',
          },
        },
      ]),
    });
  });

  it('uses the Expo access token when configured', async () => {
    process.env.EXPO_ACCESS_TOKEN = 'expo-access-token';
    const client = new PushDeliveryClient();

    await client.sendNotification(
      [
        {
          token: 'ExpoPushToken[abc]',
          platform: 'android',
          deviceId: null,
        },
      ],
      {
        id: 'notification-1',
        userId: 'user-1',
        type: 'payment_update',
        title: null,
        body: null,
        isRead: false,
        metadata: null,
        createdAt: null,
      },
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://expo.test/push',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer expo-access-token',
        }),
      }),
    );
  });

  it('skips delivery when no registered devices have Expo tokens', async () => {
    const client = new PushDeliveryClient();

    await expect(
      client.sendNotification(
        [
          {
            token: 'native-fcm-token',
            platform: 'android',
            deviceId: null,
          },
        ],
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking_update',
          title: 'Booking updated',
          body: 'Your booking changed.',
          isRead: false,
          metadata: null,
          createdAt: null,
        },
      ),
    ).resolves.toEqual({
      attempted: 0,
      delivered: 0,
      skipped: 1,
      invalidTokens: [],
      receiptChecks: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns device tokens Expo reports as no longer registered', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            status: 'error',
            message: 'The recipient device is not registered.',
            details: { error: 'DeviceNotRegistered' },
          },
          { status: 'ok', id: 'ticket-2' },
        ],
      }),
    } as Response);
    const client = new PushDeliveryClient();

    await expect(
      client.sendNotification(
        [
          {
            token: 'ExponentPushToken[stale]',
            platform: 'ios',
            deviceId: 'ios-device-1',
          },
          {
            token: 'ExponentPushToken[fresh]',
            platform: 'ios',
            deviceId: 'ios-device-2',
          },
        ],
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking_update',
          title: 'Booking updated',
          body: 'Your booking changed.',
          isRead: false,
          metadata: null,
          createdAt: null,
        },
      ),
    ).resolves.toEqual({
      attempted: 2,
      delivered: 1,
      skipped: 0,
      invalidTokens: ['ExponentPushToken[stale]'],
      receiptChecks: [
        {
          ticketId: 'ticket-2',
          token: 'ExponentPushToken[fresh]',
        },
      ],
    });
  });

  it('retries transient Expo push send failures', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: async () => 'upstream unavailable',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ status: 'ok', id: 'ticket-1' }],
        }),
      } as Response);
    const client = new PushDeliveryClient();

    await expect(
      client.sendNotification(
        [
          {
            token: 'ExponentPushToken[abc]',
            platform: 'ios',
            deviceId: 'ios-device-1',
          },
        ],
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking_update',
          title: 'Booking updated',
          body: 'Your booking changed.',
          isRead: false,
          metadata: null,
          createdAt: null,
        },
      ),
    ).resolves.toEqual({
      attempted: 1,
      delivered: 1,
      skipped: 0,
      invalidTokens: [],
      receiptChecks: [
        {
          ticketId: 'ticket-1',
          token: 'ExponentPushToken[abc]',
        },
      ],
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry permanent Expo push request failures', async () => {
    process.env.EXPO_PUSH_MAX_ATTEMPTS = '3';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'invalid payload',
    } as Response);
    const client = new PushDeliveryClient();

    await expect(
      client.sendNotification(
        [
          {
            token: 'ExponentPushToken[abc]',
            platform: 'ios',
            deviceId: 'ios-device-1',
          },
        ],
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking_update',
          title: 'Booking updated',
          body: 'Your booking changed.',
          isRead: false,
          metadata: null,
          createdAt: null,
        },
      ),
    ).rejects.toThrow('Expo push delivery failed: 400 invalid payload');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('looks up Expo push receipts and returns stale device tokens', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          'ticket-stale': {
            status: 'error',
            message: 'The device cannot receive push notifications.',
            details: { error: 'DeviceNotRegistered' },
          },
          'ticket-ok': {
            status: 'ok',
          },
        },
      }),
    } as Response);
    const client = new PushDeliveryClient();

    await expect(
      client.checkReceipts([
        {
          ticketId: 'ticket-stale',
          token: 'ExponentPushToken[stale]',
        },
        {
          ticketId: 'ticket-ok',
          token: 'ExponentPushToken[fresh]',
        },
      ]),
    ).resolves.toEqual({
      checked: 2,
      invalidTokens: ['ExponentPushToken[stale]'],
    });

    expect(global.fetch).toHaveBeenCalledWith('https://expo.test/receipts', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: ['ticket-stale', 'ticket-ok'],
      }),
    });
  });
});
