import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminServiceRequestError } from './admin-support.errors';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersGatewayService } from './admin-users.service';
import type { CreateAdminUserRequest } from './admin-users.types';

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
        accessRole: 'content-moderator',
        sendInvitation: true,
        requireTwoFactor: false,
      },
    );

    expect(adminUsersGatewayService.createUser).toHaveBeenCalledWith({
      email: 'ops@example.com',
      password: 'Password#2026',
      fullName: 'Ops Admin',
      contactNumber: '+639171234567',
      accessRole: 'content-moderator',
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
          accessRole: 'content-moderator',
          sendInvitation: true,
          requireTwoFactor: false,
        },
      }),
    );
    expect(response.data.role).toBe('admin');
  });

  it('keeps admin creation successful when audit logging fails', async () => {
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
      createAuditLog: jest.fn().mockRejectedValue(new Error('audit unavailable')),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      adminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-user-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-user-1',
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );
    const warnSpy = jest
      .spyOn(controller['logger'], 'warn')
      .mockImplementation(() => undefined);

    const response = await controller.create(
      'Bearer token',
      { headers: {}, socket: {} },
      {
        email: 'ops@example.com',
        password: 'Password#2026',
        fullName: 'Ops Admin',
      },
    );

    expect(response.data.id).toBe('new-admin-1');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not create audit log for admin user action'),
    );
    warnSpy.mockRestore();
  });

  it('rejects unknown admin access roles during admin creation', async () => {
    const adminUsersGatewayService = {
      createUser: jest.fn(),
    } as unknown as AdminUsersGatewayService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-user-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-user-1',
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );

    await expect(
      controller.create(
        'Bearer token',
        { headers: {}, socket: {} },
        {
          email: 'ops@example.com',
          password: 'Password#2026',
          fullName: 'Ops Admin',
          accessRole: 'owner',
        } as unknown as CreateAdminUserRequest,
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_admin_request',
        },
      },
      status: 400,
    });
    expect(adminUsersGatewayService.createUser).not.toHaveBeenCalled();
  });

  it('preserves admin-service validation and conflict errors', async () => {
    const adminUsersGatewayService = {
      createUser: jest.fn().mockRejectedValue(
        new AdminServiceRequestError(
          409,
          'registration_conflict',
          'An account with this email already exists.',
        ),
      ),
    } as unknown as AdminUsersGatewayService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-user-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-user-1',
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );

    await expect(
      controller.create(
        'Bearer token',
        { headers: {}, socket: {} },
        {
          email: 'ops@example.com',
          password: 'Password#2026',
          fullName: 'Ops Admin',
        },
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'registration_conflict',
          message: 'An account with this email already exists.',
          details: {},
        },
      },
      status: 409,
    });
  });

  it('deletes admin users through the admin service and audits the action', async () => {
    const adminUsersGatewayService = {
      deleteUser: jest.fn().mockResolvedValue({
        id: 'admin-2',
        email: 'ops@example.com',
        fullName: 'Ops Admin',
        contactNumber: null,
        role: 'admin',
        accessRole: 'operations-manager',
        accessRoleLabel: 'Operations Manager',
        permissions: ['bookings.manage'],
        requireTwoFactor: false,
        invitationSent: true,
        status: 'active',
        createdAt: '2026-05-17T00:00:00.000Z',
      }),
    } as unknown as AdminUsersGatewayService;
    const adminAuditGatewayService = {
      createAuditLog: jest.fn().mockResolvedValue({ id: 'audit-2' }),
    } as unknown as AdminAuditGatewayService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      adminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            email: 'root@example.com',
            fullName: 'Root Admin',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );

    const response = await controller.delete(
      'Bearer token',
      { headers: {}, socket: {} },
      'admin-2',
    );

    expect(adminUsersGatewayService.deleteUser).toHaveBeenCalledWith('admin-2');
    expect(adminAuditGatewayService.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'Deleted admin user',
        actionType: 'delete',
        entityType: 'User',
        entityId: 'admin-2',
        metadata: {
          userId: 'admin-2',
          email: 'ops@example.com',
          accessRole: 'operations-manager',
        },
      }),
    );
    expect(response.data.id).toBe('admin-2');
  });

  it('rejects deleting the currently signed-in admin', async () => {
    const adminUsersGatewayService = {
      deleteUser: jest.fn(),
    } as unknown as AdminUsersGatewayService;
    const controller = new AdminUsersController(
      adminUsersGatewayService,
      { createAuditLog: jest.fn() } as unknown as AdminAuditGatewayService,
      { authenticate: jest.fn().mockResolvedValue('admin-1') } as unknown as AuthTokenService,
      {
        getCurrentUser: jest.fn().mockResolvedValue({
          user: {
            id: 'admin-1',
            email: 'root@example.com',
            fullName: 'Root Admin',
            role: 'admin',
            status: 'active',
          },
        }),
      } as unknown as CurrentUserService,
    );

    await expect(
      controller.delete(
        'Bearer token',
        { headers: {}, socket: {} },
        'admin-1',
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_admin_request',
        },
      },
      status: 400,
    });
    expect(adminUsersGatewayService.deleteUser).not.toHaveBeenCalled();
  });
});
