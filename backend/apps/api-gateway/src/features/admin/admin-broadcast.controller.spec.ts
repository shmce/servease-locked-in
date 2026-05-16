import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminBroadcastController } from './admin-broadcast.controller';
import { AdminUsersGatewayService } from './admin-users.service';

describe('AdminBroadcastController', () => {
  it('sends broadcast notifications to the selected active audience', async () => {
    const adminUsersGatewayService = {
      listUsers: jest.fn().mockResolvedValue([
        {
          id: 'customer-1',
          email: 'customer@servease.test',
          fullName: 'Casey Customer',
          role: 'customer',
          status: 'active',
        },
        {
          id: 'customer-2',
          email: 'suspended@servease.test',
          fullName: 'Suspended Customer',
          role: 'customer',
          status: 'suspended',
        },
      ]),
    } as unknown as AdminUsersGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    } as unknown as NotificationServiceClient;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminBroadcastController(
      { authenticate: jest.fn().mockResolvedValue('admin-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            email: 'admin@servease.test',
            fullName: 'Admin User',
            role: 'admin',
          },
        }),
      } as unknown as CurrentUserService,
      adminUsersGatewayService,
      notificationServiceClient,
      adminAuditGatewayService,
    );

    const response = await controller.create(
      'Bearer token',
      { headers: {}, socket: {} },
      {
        audience: 'customers',
        title: 'Holiday schedule',
        message: 'ServEase support hours are updated this week.',
      },
    );

    expect(adminUsersGatewayService.listUsers).toHaveBeenCalledWith(
      'customer',
      'active',
      null,
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: 'customer-1',
      type: 'admin_broadcast',
      title: 'Holiday schedule',
      body: 'ServEase support hours are updated this week.',
      metadata: {
        audience: 'customers',
        adminUserId: 'admin-1',
      },
    });
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Sent admin broadcast',
        actionType: 'create',
        entityType: 'Broadcast',
        metadata: expect.objectContaining({
          audience: 'customers',
          deliveredCount: 1,
        }),
      }),
    );
    expect(response.data).toEqual({
      audience: 'customers',
      deliveredCount: 1,
      failedCount: 0,
    });
  });
});
