import { UserServiceClient } from '../current-user/clients/user-service.client';
import { UserPreferenceGatewayService } from './preference.service';

describe('UserPreferenceGatewayService', () => {
  it('forwards user preference reads and updates to user-service', async () => {
    const userServiceClient = {
      getUserPreferences: jest.fn().mockResolvedValue({
        userId: 'user-1',
        pushNotificationsEnabled: true,
        darkModeEnabled: false,
        language: 'en',
        notificationPreferences: { dailySummary: true },
        updatedAt: '2026-05-16T00:00:00.000Z',
      }),
      updateUserPreferences: jest.fn().mockResolvedValue({
        userId: 'user-1',
        pushNotificationsEnabled: false,
        darkModeEnabled: true,
        language: 'fil',
        notificationPreferences: { dailySummary: false },
        updatedAt: '2026-05-16T00:01:00.000Z',
      }),
    } as unknown as UserServiceClient;
    const service = new UserPreferenceGatewayService(userServiceClient);

    const current = await service.getPreferences('user-1');
    const updated = await service.updatePreferences('user-1', {
      pushNotificationsEnabled: false,
      darkModeEnabled: true,
      language: 'fil',
      notificationPreferences: { dailySummary: false },
    });

    expect(userServiceClient.getUserPreferences).toHaveBeenCalledWith('user-1');
    expect(userServiceClient.updateUserPreferences).toHaveBeenCalledWith(
      'user-1',
      {
        pushNotificationsEnabled: false,
      darkModeEnabled: true,
      language: 'fil',
      notificationPreferences: { dailySummary: false },
    },
  );
    expect(current.language).toBe('en');
    expect(updated.language).toBe('fil');
  });
});
