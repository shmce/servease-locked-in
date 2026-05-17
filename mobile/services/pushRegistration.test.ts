import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { syncPushRegistration } from './pushRegistration';

describe('syncPushRegistration', () => {
  it('registers an Expo push token when notifications are enabled and permission is granted', async () => {
    const calls: unknown[] = [];

    const result = await syncPushRegistration({
      enabled: true,
      apiOptions: { token: 'access-token' },
      platform: 'ios',
      deviceId: 'ios-device-1',
      notifications: {
        getPermissionsAsync: async () => ({ status: 'undetermined' }),
        requestPermissionsAsync: async () => ({ status: 'granted' }),
        getExpoPushTokenAsync: async () => ({
          data: 'ExponentPushToken[abc]',
        }),
      },
      registerDevice: async (body, options) => {
        calls.push({ body, options });
        return {
          id: 'device-1',
          userId: 'user-1',
          token: body.token,
          platform: body.platform,
          deviceId: body.deviceId ?? null,
          isActive: true,
          lastRegisteredAt: '2026-05-18T00:00:00.000Z',
          createdAt: '2026-05-18T00:00:00.000Z',
        };
      },
    });

    assert.equal(result.status, 'registered');
    assert.deepEqual(calls, [
      {
        body: {
          token: 'ExponentPushToken[abc]',
          platform: 'ios',
          deviceId: 'ios-device-1',
        },
        options: { token: 'access-token' },
      },
    ]);
  });

  it('skips registration when the user has disabled push notifications', async () => {
    const calls: unknown[] = [];

    const result = await syncPushRegistration({
      enabled: false,
      apiOptions: { token: 'access-token' },
      notifications: {
        getPermissionsAsync: async () => ({ status: 'granted' }),
        requestPermissionsAsync: async () => ({ status: 'granted' }),
        getExpoPushTokenAsync: async () => ({
          data: 'ExponentPushToken[abc]',
        }),
      },
      registerDevice: async () => {
        throw new Error('registration should not be called');
      },
      unregisterDevice: async (token, options) => {
        calls.push({ token, options });
        return { ok: true };
      },
    });

    assert.equal(result.status, 'disabled');
    assert.deepEqual(calls, [
      {
        token: 'ExponentPushToken[abc]',
        options: { token: 'access-token' },
      },
    ]);
  });

  it('does not request permission when disabling push notifications without existing permission', async () => {
    const result = await syncPushRegistration({
      enabled: false,
      apiOptions: { token: 'access-token' },
      notifications: {
        getPermissionsAsync: async () => ({ status: 'undetermined' }),
        requestPermissionsAsync: async () => {
          throw new Error('permission should not be requested');
        },
        getExpoPushTokenAsync: async () => {
          throw new Error('token should not be requested');
        },
      },
      registerDevice: async () => {
        throw new Error('registration should not be called');
      },
      unregisterDevice: async () => {
        throw new Error('unregistration should not be called');
      },
    });

    assert.equal(result.status, 'disabled');
  });

  it('skips registration when notification permission is denied', async () => {
    const result = await syncPushRegistration({
      enabled: true,
      apiOptions: { token: 'access-token' },
      notifications: {
        getPermissionsAsync: async () => ({ status: 'denied' }),
        requestPermissionsAsync: async () => ({ status: 'denied' }),
        getExpoPushTokenAsync: async () => ({
          data: 'ExponentPushToken[abc]',
        }),
      },
      registerDevice: async () => {
        throw new Error('registration should not be called');
      },
    });

    assert.equal(result.status, 'permission_denied');
  });
});
