import { InvalidNotificationRequestError } from './notification.errors';
import { NotificationService } from './notification.service';
import { PushDeliveryClient } from './push-delivery.client';
import { SupabaseNotificationRepository } from './supabase-notification.repository';

describe('NotificationService', () => {
  const createPushDeliveryClient = (): PushDeliveryClient =>
    ({
      sendNotification: jest.fn().mockResolvedValue({
        attempted: 0,
        delivered: 0,
        skipped: 0,
        invalidTokens: [],
        receiptChecks: [],
      }),
      checkReceipts: jest.fn().mockResolvedValue({
        checked: 0,
        invalidTokens: [],
      }),
    }) as unknown as PushDeliveryClient;

  it('rejects missing notification type before repository writes', async () => {
    const repository = {
      createNotification: jest.fn(),
    } as unknown as SupabaseNotificationRepository;
    const service = new NotificationService(repository, createPushDeliveryClient());

    await expect(
      service.createNotification({
        userId: 'user-1',
        type: ' ',
        title: 'Title',
        body: null,
        metadata: null,
      }),
    ).rejects.toBeInstanceOf(InvalidNotificationRequestError);
    expect(repository.createNotification).not.toHaveBeenCalled();
  });

  it('rejects invalid push platforms before repository writes', async () => {
    const repository = {
      registerPushDevice: jest.fn(),
    } as unknown as SupabaseNotificationRepository;
    const service = new NotificationService(repository, createPushDeliveryClient());

    await expect(
      service.registerPushDevice({
        userId: 'user-1',
        token: 'ExponentPushToken[abc]',
        platform: 'desktop',
        deviceId: null,
      }),
    ).rejects.toBeInstanceOf(InvalidNotificationRequestError);
    expect(repository.registerPushDevice).not.toHaveBeenCalled();
  });

  it('trims and registers push devices through the repository', async () => {
    const repository = {
      registerPushDevice: jest.fn().mockResolvedValue({
        id: 'device-1',
        userId: 'user-1',
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
        isActive: true,
      }),
    } as unknown as SupabaseNotificationRepository;
    const service = new NotificationService(repository, createPushDeliveryClient());

    const device = await service.registerPushDevice({
      userId: 'user-1',
      token: ' ExponentPushToken[abc] ',
      platform: 'ios',
      deviceId: ' ios-device-1 ',
    });

    expect(repository.registerPushDevice).toHaveBeenCalledWith({
      userId: 'user-1',
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
      deviceId: 'ios-device-1',
    });
    expect(device.isActive).toBe(true);
  });

  it('delivers created notifications to active push devices', async () => {
    const notification = {
      id: 'notification-1',
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      isRead: false,
      metadata: { bookingId: 'booking-1' },
      createdAt: '2026-05-18T00:00:00.000Z',
    };
    const devices = [
      {
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
      },
    ];
    const repository = {
      createNotification: jest.fn().mockResolvedValue(notification),
      listActivePushDevices: jest.fn().mockResolvedValue(devices),
    } as unknown as SupabaseNotificationRepository;
    const pushDeliveryClient = {
      sendNotification: jest.fn().mockResolvedValue({
        attempted: 1,
        delivered: 1,
        skipped: 0,
        invalidTokens: [],
        receiptChecks: [],
      }),
    } as unknown as PushDeliveryClient;
    const service = new NotificationService(repository, pushDeliveryClient);

    await expect(
      service.createNotification({
        userId: 'user-1',
        type: ' booking_update ',
        title: ' Booking updated ',
        body: ' Your booking changed. ',
        metadata: { bookingId: 'booking-1' },
      }),
    ).resolves.toEqual(notification);

    expect(repository.createNotification).toHaveBeenCalledWith({
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      metadata: { bookingId: 'booking-1' },
    });
    expect(repository.listActivePushDevices).toHaveBeenCalledWith('user-1');
    expect(pushDeliveryClient.sendNotification).toHaveBeenCalledWith(
      devices,
      notification,
    );
  });

  it('deactivates stale push tokens reported by Expo delivery', async () => {
    const notification = {
      id: 'notification-1',
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      isRead: false,
      metadata: null,
      createdAt: '2026-05-18T00:00:00.000Z',
    };
    const repository = {
      createNotification: jest.fn().mockResolvedValue(notification),
      listActivePushDevices: jest.fn().mockResolvedValue([
        {
          token: 'ExponentPushToken[stale]',
          platform: 'ios',
          deviceId: null,
        },
      ]),
      deactivatePushDevices: jest.fn().mockResolvedValue(1),
    } as unknown as SupabaseNotificationRepository;
    const pushDeliveryClient = {
      sendNotification: jest.fn().mockResolvedValue({
        attempted: 1,
        delivered: 0,
        skipped: 0,
        invalidTokens: ['ExponentPushToken[stale]'],
        receiptChecks: [],
      }),
    } as unknown as PushDeliveryClient;
    const service = new NotificationService(repository, pushDeliveryClient);

    await service.createNotification({
      userId: 'user-1',
      type: 'booking_update',
    });

    expect(repository.deactivatePushDevices).toHaveBeenCalledWith([
      'ExponentPushToken[stale]',
    ]);
  });

  it('does not fail notification creation when push delivery fails', async () => {
    const notification = {
      id: 'notification-1',
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      isRead: false,
      metadata: null,
      createdAt: '2026-05-18T00:00:00.000Z',
    };
    const repository = {
      createNotification: jest.fn().mockResolvedValue(notification),
      listActivePushDevices: jest.fn().mockResolvedValue([
        {
          token: 'ExponentPushToken[abc]',
          platform: 'ios',
          deviceId: null,
        },
      ]),
    } as unknown as SupabaseNotificationRepository;
    const pushDeliveryClient = {
      sendNotification: jest.fn().mockRejectedValue(new Error('expo down')),
    } as unknown as PushDeliveryClient;
    const service = new NotificationService(repository, pushDeliveryClient);

    await expect(
      service.createNotification({
        userId: 'user-1',
        type: 'booking_update',
      }),
    ).resolves.toEqual(notification);
  });

  it('deactivates stale push tokens reported by delayed Expo receipts', async () => {
    const originalReceiptDelay = process.env.EXPO_PUSH_RECEIPT_DELAY_MS;
    process.env.EXPO_PUSH_RECEIPT_DELAY_MS = '0';
    const notification = {
      id: 'notification-1',
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      isRead: false,
      metadata: null,
      createdAt: '2026-05-18T00:00:00.000Z',
    };
    const repository = {
      createNotification: jest.fn().mockResolvedValue(notification),
      listActivePushDevices: jest.fn().mockResolvedValue([
        {
          token: 'ExponentPushToken[stale]',
          platform: 'ios',
          deviceId: null,
        },
      ]),
      deactivatePushDevices: jest.fn().mockResolvedValue(1),
    } as unknown as SupabaseNotificationRepository;
    const receiptChecks = [
      {
        ticketId: 'ticket-stale',
        token: 'ExponentPushToken[stale]',
      },
    ];
    const pushDeliveryClient = {
      sendNotification: jest.fn().mockResolvedValue({
        attempted: 1,
        delivered: 1,
        skipped: 0,
        invalidTokens: [],
        receiptChecks,
      }),
      checkReceipts: jest.fn().mockResolvedValue({
        checked: 1,
        invalidTokens: ['ExponentPushToken[stale]'],
      }),
    } as unknown as PushDeliveryClient;
    const service = new NotificationService(repository, pushDeliveryClient);

    try {
      await service.createNotification({
        userId: 'user-1',
        type: 'booking_update',
      });
      await Promise.resolve();

      expect(pushDeliveryClient.checkReceipts).toHaveBeenCalledWith(
        receiptChecks,
      );
      expect(repository.deactivatePushDevices).toHaveBeenCalledWith([
        'ExponentPushToken[stale]',
      ]);
    } finally {
      if (originalReceiptDelay === undefined) {
        delete process.env.EXPO_PUSH_RECEIPT_DELAY_MS;
      } else {
        process.env.EXPO_PUSH_RECEIPT_DELAY_MS = originalReceiptDelay;
      }
    }
  });
});
