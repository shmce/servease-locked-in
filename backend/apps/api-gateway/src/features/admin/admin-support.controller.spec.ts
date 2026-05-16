import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminSupportController } from './admin-support.controller';
import { AdminSupportGatewayService } from './admin-support.service';

describe('AdminSupportController', () => {
  it('updates support tickets only after resolving an admin user', async () => {
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
    const adminSupportGatewayService = {
      updateTicketStatus: jest.fn().mockResolvedValue({
        id: 'ticket-1',
        status: 'resolved',
      }),
    } as unknown as AdminSupportGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminSupportController(
      adminSupportGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.updateTicketStatus(
      'Bearer token',
      { headers: {}, socket: {} },
      'ticket-1',
      { status: 'resolved' },
    );

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminSupportGatewayService.updateTicketStatus).toHaveBeenCalledWith(
      'ticket-1',
      'resolved',
    );
    expect(response.data.status).toBe('resolved');
  });

  it('rejects invalid support status without calling the admin service', async () => {
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
    const adminSupportGatewayService = {
      updateTicketStatus: jest.fn(),
    } as unknown as AdminSupportGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn(),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminSupportController(
      adminSupportGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    await expect(
      controller.updateTicketStatus(
        'Bearer token',
        { headers: {}, socket: {} },
        'ticket-1',
        {
          status: 'waiting',
        },
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
      status: 400,
    });
    expect(adminSupportGatewayService.updateTicketStatus).not.toHaveBeenCalled();
  });
});
