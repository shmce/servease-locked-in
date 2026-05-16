import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersGatewayService } from './admin-users.service';

describe('AdminUsersController', () => {
  it('creates admin users through the admin service and audits the action', async () => {
    const adminUsersGatewayService = {
      createUser: jest.fn().mockResolvedValue({
        id: 'new-admin-1',
        email: 'ops@example.com',
        fullName: 'Ops Admin',
        contactNumber: '+639171234567',
        role: 'admin',
        status: 'active',
        createdAt: '2026-05-17T00:00:00.000Z',
      }),
    } as unknown as AdminUsersGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('admin-user-1'),
    } as unknown as AuthTokenService;
    const currentUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        user: {
          id: 'admin-user-1',
          email: 'admin@example.com',
          fullName: 'Admin User',
          role: 'admin',
          status: 'active',
        },
      }),
    } as unknown as CurrentUserService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.create(
      'Bearer token',
      { headers: {}, socket: {} },
      {
        email: ' Ops@Example.com ',
        password: 'Password#2026',
        fullName: ' Ops Admin ',
        contactNumber: ' +639171234567 ',
        accessRole: 'operations-manager',
        sendInvitation: true,
        requireTwoFactor: false,
      },
    );

    expect(adminUsersGatewayService.createUser).toHaveBeenCalledWith({
      email: 'ops@example.com',
      password: 'Password#2026',
      fullName: 'Ops Admin',
      contactNumber: '+639171234567',
      accessRole: 'operations-manager',
      sendInvitation: true,
      requireTwoFactor: false,
    });
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Created admin user',
        actionType: 'create',
        entityType: 'User',
        entityId: 'new-admin-1',
        metadata: {
          userId: 'new-admin-1',
          email: 'ops@example.com',
          accessRole: 'operations-manager',
          sendInvitation: true,
          requireTwoFactor: false,
        },
      }),
    );
    expect(response.data.role).toBe('admin');
  });
});
