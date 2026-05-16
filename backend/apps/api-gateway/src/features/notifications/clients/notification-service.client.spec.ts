import { ConfigService } from '@nestjs/config';
import { NotificationServiceClient } from './notification-service.client';

describe('NotificationServiceClient', () => {
  it('posts internal notification creation requests to the notification service', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'notification-1',
          userId: 'provider-user-1',
          type: 'booking_created',
          title: 'New booking request',
          body: 'Casey Customer requested Deep Clean.',
          isRead: false,
          metadata: {
            bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          },
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      }),
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    try {
      const client = new NotificationServiceClient(configService());
      await client.createNotification({
        userId: 'provider-user-1',
        type: 'booking_created',
        title: 'New booking request',
        body: 'Casey Customer requested Deep Clean.',
        metadata: {
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://notification-service.test/internal/notifications',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'provider-user-1',
            type: 'booking_created',
            title: 'New booking request',
            body: 'Casey Customer requested Deep Clean.',
            metadata: {
              bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
            },
          }),
        },
      );
    } finally {
      globalThis.fetch = originalFetch;
      jest.restoreAllMocks();
    }
  });
});

function configService(): ConfigService {
  return {
    get: jest.fn().mockReturnValue('http://notification-service.test'),
  } as unknown as ConfigService;
}
