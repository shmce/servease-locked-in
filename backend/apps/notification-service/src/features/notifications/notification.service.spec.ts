import { InvalidNotificationRequestError } from './notification.errors';
import { NotificationService } from './notification.service';
import { SupabaseNotificationRepository } from './supabase-notification.repository';

describe('NotificationService', () => {
  it('rejects missing notification type before repository writes', async () => {
    const repository = {
      createNotification: jest.fn(),
    } as unknown as SupabaseNotificationRepository;
    const service = new NotificationService(repository);

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
});
