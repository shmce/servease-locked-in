import { SupabasePreferenceRepository } from './supabase-preference.repository';

describe('SupabasePreferenceRepository', () => {
  it('loads and updates user preferences through RPCs', async () => {
    const rpc = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            user_id: 'user-1',
            push_notifications_enabled: true,
            dark_mode_enabled: false,
            language: 'en',
            notification_preferences: { dailySummary: true },
            updated_at: '2026-05-16T00:00:00.000Z',
          },
          error: null,
        }),
      })
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            user_id: 'user-1',
            push_notifications_enabled: false,
            dark_mode_enabled: true,
            language: 'fil',
            notification_preferences: { dailySummary: false },
            updated_at: '2026-05-16T00:01:00.000Z',
          },
          error: null,
        }),
      });
    const repository = new SupabasePreferenceRepository({ rpc });

    await expect(repository.getByUserId('user-1')).resolves.toEqual({
      userId: 'user-1',
      pushNotificationsEnabled: true,
      darkModeEnabled: false,
      language: 'en',
      notificationPreferences: { dailySummary: true },
      updatedAt: '2026-05-16T00:00:00.000Z',
    });
    await expect(
      repository.update({
        userId: 'user-1',
        pushNotificationsEnabled: false,
        darkModeEnabled: true,
        language: 'fil',
        notificationPreferences: { dailySummary: false },
      }),
    ).resolves.toMatchObject({
      userId: 'user-1',
      pushNotificationsEnabled: false,
      darkModeEnabled: true,
      language: 'fil',
      notificationPreferences: { dailySummary: false },
    });
    expect(rpc).toHaveBeenNthCalledWith(1, 'servease_get_user_preferences', {
      p_user_id: 'user-1',
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'servease_upsert_user_preferences', {
      p_user_id: 'user-1',
      p_push_notifications_enabled: false,
      p_dark_mode_enabled: true,
      p_language: 'fil',
      p_notification_preferences: { dailySummary: false },
    });
  });
});
