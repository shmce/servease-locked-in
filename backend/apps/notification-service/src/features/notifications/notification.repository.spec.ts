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
});
