import { AuthTokenService } from '../current-user/auth-token.service';
import { NotificationController } from './notification.controller';
import { NotificationGatewayService } from './notification.service';

describe('NotificationController', () => {
  it('marks notifications read for the authenticated user', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('user-1'),
    } as unknown as AuthTokenService;
    const notificationGatewayService = {
      markRead: jest.fn().mockResolvedValue({
        id: 'notification-1',
        isRead: true,
      }),
    } as unknown as NotificationGatewayService;
    const controller = new NotificationController(
      notificationGatewayService,
      authTokenService,
    );

    const response = await controller.markRead('Bearer token', 'notification-1');

    expect(notificationGatewayService.markRead).toHaveBeenCalledWith(
      'notification-1',
      'user-1',
    );
    expect(response.data.isRead).toBe(true);
  });

  it('registers a push device for the authenticated user', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('user-1'),
    } as unknown as AuthTokenService;
    const notificationGatewayService = {
      registerPushDevice: jest.fn().mockResolvedValue({
        id: 'device-1',
        userId: 'user-1',
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
        isActive: true,
      }),
    } as unknown as NotificationGatewayService;
    const controller = new NotificationController(
      notificationGatewayService,
      authTokenService,
    );

    const response = await controller.registerPushDevice('Bearer token', {
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
      deviceId: 'ios-device-1',
    });

    expect(notificationGatewayService.registerPushDevice).toHaveBeenCalledWith(
      'user-1',
      {
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
      },
    );
    expect(response.data.isActive).toBe(true);
  });

  it('unregisters a push device for the authenticated user', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('user-1'),
    } as unknown as AuthTokenService;
    const notificationGatewayService = {
      unregisterPushDevice: jest.fn().mockResolvedValue({ ok: true }),
    } as unknown as NotificationGatewayService;
    const controller = new NotificationController(
      notificationGatewayService,
      authTokenService,
    );

    const response = await controller.unregisterPushDevice(
      'Bearer token',
      'ExponentPushToken%5Babc%5D',
    );

    expect(notificationGatewayService.unregisterPushDevice).toHaveBeenCalledWith(
      'user-1',
      'ExponentPushToken[abc]',
    );
    expect(response.data.ok).toBe(true);
  });
});
