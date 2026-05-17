import { SupabaseNotificationRepository } from './supabase-notification.repository';

describe('SupabaseNotificationRepository', () => {
  it('creates notifications through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'notification-1',
        user_id: 'user-1',
        type: 'booking_update',
        title: 'Booking updated',
        body: 'Your booking changed.',
        is_read: false,
        metadata: { bookingId: 'booking-1' },
        created_at: '2026-05-15T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseNotificationRepository({ rpc });

    const notification = await repository.createNotification({
      userId: 'user-1',
      type: 'booking_update',
      title: 'Booking updated',
      body: 'Your booking changed.',
      metadata: { bookingId: 'booking-1' },
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_notification', {
      p_user_id: 'user-1',
      p_type: 'booking_update',
      p_title: 'Booking updated',
      p_body: 'Your booking changed.',
      p_metadata: { bookingId: 'booking-1' },
    });
    expect(notification.isRead).toBe(false);
  });

  it('registers push devices through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'device-1',
        user_id: 'user-1',
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        device_id: 'ios-device-1',
        is_active: true,
        last_registered_at: '2026-05-18T00:00:00.000Z',
        created_at: '2026-05-18T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseNotificationRepository({ rpc });

    const device = await repository.registerPushDevice({
      userId: 'user-1',
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
      deviceId: 'ios-device-1',
    });

    expect(rpc).toHaveBeenCalledWith('servease_register_push_device', {
      p_user_id: 'user-1',
      p_token: 'ExponentPushToken[abc]',
      p_platform: 'ios',
      p_device_id: 'ios-device-1',
    });
    expect(device.isActive).toBe(true);
  });

  it('lists active push devices through the service RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          token: 'ExponentPushToken[abc]',
          platform: 'ios',
          device_id: 'ios-device-1',
        },
      ],
      error: null,
    });
    const repository = new SupabaseNotificationRepository({ rpc });

    const devices = await repository.listActivePushDevices('user-1');

    expect(rpc).toHaveBeenCalledWith('servease_list_active_push_devices', {
      p_user_id: 'user-1',
    });
    expect(devices).toEqual([
      {
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
      },
    ]);
  });

  it('deactivates stale push devices through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        deactivated_count: 2,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseNotificationRepository({ rpc });

    const count = await repository.deactivatePushDevices([
      'ExponentPushToken[one]',
      'ExponentPushToken[two]',
    ]);

    expect(rpc).toHaveBeenCalledWith('servease_deactivate_push_devices', {
      p_tokens: ['ExponentPushToken[one]', 'ExponentPushToken[two]'],
    });
    expect(count).toBe(2);
  });
});
