import { CurrentUserService } from '../current-user/current-user.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminDisputeController } from './admin-dispute.controller';
import { AdminDisputeGatewayService } from './admin-dispute.service';

describe('AdminDisputeController', () => {
  it('lists disputes only after resolving an admin user', async () => {
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
    const adminDisputeGatewayService = {
      listDisputes: jest.fn().mockResolvedValue([
        {
          id: 'dispute-1',
          status: 'open',
        },
      ]),
    } as unknown as AdminDisputeGatewayService;
    const controller = new AdminDisputeController(
      adminDisputeGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.list('Bearer token', 'open');

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminDisputeGatewayService.listDisputes).toHaveBeenCalledWith('open');
    expect(response.data[0].status).toBe('open');
  });

  it('rejects invalid dispute status without calling the admin service', async () => {
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
    const adminDisputeGatewayService = {
      listDisputes: jest.fn(),
    } as unknown as AdminDisputeGatewayService;
    const controller = new AdminDisputeController(
      adminDisputeGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    await expect(controller.list('Bearer token', 'escalated')).rejects.toMatchObject({
      response: expect.objectContaining({
        error: expect.objectContaining({
          code: 'invalid_admin_request',
        }),
      }),
      status: 400,
    });
    expect(adminDisputeGatewayService.listDisputes).not.toHaveBeenCalled();
  });

  it('resolves disputes only after resolving an admin user', async () => {
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
    const adminDisputeGatewayService = {
      resolveDispute: jest.fn().mockResolvedValue({
        id: 'dispute-1',
        bookingId: 'booking-1',
        status: 'resolved',
        amount: 1500,
      }),
    } as unknown as AdminDisputeGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminDisputeController(
      adminDisputeGatewayService,
      adminAuditGatewayService,
      authTokenService,
      currentUserService,
    );

    const response = await controller.resolve(
      'Bearer token',
      { headers: {}, socket: {} },
      'dispute-1',
    );

    expect(currentUserService.getCurrentUser).toHaveBeenCalledWith('admin-user-1');
    expect(adminDisputeGatewayService.resolveDispute).toHaveBeenCalledWith(
      'dispute-1',
    );
    expect(response.data.status).toBe('resolved');
  });

  it('keeps dispute resolution successful when audit logging fails', async () => {
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
    const adminDisputeGatewayService = {
      resolveDispute: jest.fn().mockResolvedValue({
        id: 'dispute-1',
        bookingId: 'booking-1',
        status: 'resolved',
        amount: 1500,
      }),
    } as unknown as AdminDisputeGatewayService;
    const controller = new AdminDisputeController(
      adminDisputeGatewayService,
      {
        createAuditLog: jest
          .fn()
          .mockRejectedValue(new Error('audit unavailable')),
      } as unknown as AdminAuditGatewayService,
      authTokenService,
      currentUserService,
    );
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.resolve(
      'Bearer token',
      { headers: {}, socket: {} },
      'dispute-1',
    );

    expect(response.data.status).toBe('resolved');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create dispute audit log'),
    );
    warnSpy.mockRestore();
  });
});
