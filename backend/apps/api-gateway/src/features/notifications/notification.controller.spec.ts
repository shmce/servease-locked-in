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
});
