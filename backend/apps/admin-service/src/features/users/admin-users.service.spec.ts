import { AdminUsersGatewayService } from './admin-users.service';
import { AuthServiceClient } from './clients/auth-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { SupabaseAdminUserAccessRepository } from './supabase-admin-user-access.repository';

describe('AdminUsersGatewayService', () => {
  it('persists access role metadata when creating an admin user', async () => {
    const userClient = {} as unknown as UserServiceClient;
    const authServiceClient = {
      createAdminUser: jest.fn().mockResolvedValue({
        id: 'admin-2',
        email: 'ops@example.com',
        fullName: 'Ops Admin',
        contactNumber: '+639171234567',
        role: 'admin',
        status: 'active',
        createdAt: '2026-05-17T00:00:00.000Z',
      }),
    } as unknown as AuthServiceClient;
    const accessRepository = {
      upsertAccess: jest.fn().mockResolvedValue({
        adminUserId: 'admin-2',
        accessRole: 'operations-manager',
        requireTwoFactor: true,
        invitationSent: true,
      }),
    } as unknown as SupabaseAdminUserAccessRepository;
    const invitationDeliveryService = {
      sendInvitation: jest.fn().mockResolvedValue(true),
    };
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      invitationDeliveryService,
    );

    const user = await service.createUser({
      email: 'ops@example.com',
      password: 'Password#2026',
      fullName: 'Ops Admin',
      contactNumber: '+639171234567',
      accessRole: 'operations-manager',
      sendInvitation: true,
      requireTwoFactor: true,
    });

    expect(invitationDeliveryService.sendInvitation).toHaveBeenCalledWith({
      email: 'ops@example.com',
      fullName: 'Ops Admin',
      temporaryPassword: 'Password#2026',
      accessRole: 'operations-manager',
    });
    expect(accessRepository.upsertAccess).toHaveBeenCalledWith({
      adminUserId: 'admin-2',
      accessRole: 'operations-manager',
      requireTwoFactor: true,
      invitationSent: true,
    });
    expect(user).toEqual(
      expect.objectContaining({
        id: 'admin-2',
        accessRole: 'operations-manager',
        permissions: expect.arrayContaining(['bookings.manage']),
      }),
    );
  });

  it('creates the admin user when APICenter invitation delivery fails', async () => {
    const userClient = {} as unknown as UserServiceClient;
    const authServiceClient = {
      createAdminUser: jest.fn().mockResolvedValue({
        id: 'admin-3',
        email: 'ops-fallback@example.com',
        fullName: 'Fallback Admin',
        contactNumber: null,
        role: 'admin',
        status: 'active',
        createdAt: '2026-05-17T00:00:00.000Z',
      }),
    } as unknown as AuthServiceClient;
    const accessRepository = {
      upsertAccess: jest.fn().mockResolvedValue({
        adminUserId: 'admin-3',
        accessRole: 'customer-support',
        requireTwoFactor: false,
        invitationSent: false,
      }),
    } as unknown as SupabaseAdminUserAccessRepository;
    const invitationDeliveryService = {
      sendInvitation: jest.fn().mockResolvedValue(false),
    };
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      invitationDeliveryService,
    );

    const user = await service.createUser({
      email: 'ops-fallback@example.com',
      password: 'Password#2026',
      fullName: 'Fallback Admin',
      contactNumber: null,
      accessRole: 'customer-support',
      sendInvitation: true,
      requireTwoFactor: false,
    });

    expect(invitationDeliveryService.sendInvitation).toHaveBeenCalledWith({
      email: 'ops-fallback@example.com',
      fullName: 'Fallback Admin',
      temporaryPassword: 'Password#2026',
      accessRole: 'customer-support',
    });
    expect(accessRepository.upsertAccess).toHaveBeenCalledWith({
      adminUserId: 'admin-3',
      accessRole: 'customer-support',
      requireTwoFactor: false,
      invitationSent: false,
    });
    expect(user).toEqual(
      expect.objectContaining({
        id: 'admin-3',
        accessRole: 'customer-support',
        invitationSent: false,
      }),
    );
  });

  it('enriches listed admin users with persisted access role permissions', async () => {
    const userClient = {
      listUsers: jest.fn().mockResolvedValue([
        {
          id: 'admin-1',
          email: 'admin@example.com',
          fullName: 'Admin User',
          contactNumber: null,
          role: 'admin',
          status: 'active',
          createdAt: '2026-05-17T00:00:00.000Z',
        },
      ]),
    } as unknown as UserServiceClient;
    const authServiceClient = {} as unknown as AuthServiceClient;
    const accessRepository = {
      getAccessByUserIds: jest.fn().mockResolvedValue(
        new Map([
          [
            'admin-1',
            {
              adminUserId: 'admin-1',
              accessRole: 'finance-manager',
              requireTwoFactor: false,
              invitationSent: false,
            },
          ],
        ]),
      ),
    } as unknown as SupabaseAdminUserAccessRepository;
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      { sendInvitation: jest.fn() },
    );

    const users = await service.listUsers('admin', null, null);

    expect(accessRepository.getAccessByUserIds).toHaveBeenCalledWith([
      'admin-1',
    ]);
    expect(users[0]).toEqual(
      expect.objectContaining({
        id: 'admin-1',
        accessRole: 'finance-manager',
        accessRoleLabel: 'Finance Manager',
        permissions: expect.arrayContaining(['finance.manage']),
      }),
    );
  });

  it('updates persisted access role permissions for an existing admin user', async () => {
    const userClient = {
      listUsers: jest.fn().mockResolvedValue([
        {
          id: 'admin-1',
          email: 'admin@example.com',
          fullName: 'Admin User',
          contactNumber: null,
          role: 'admin',
          status: 'active',
          createdAt: '2026-05-17T00:00:00.000Z',
        },
      ]),
    } as unknown as UserServiceClient;
    const authServiceClient = {} as unknown as AuthServiceClient;
    const accessRepository = {
      upsertAccess: jest.fn().mockResolvedValue({
        adminUserId: 'admin-1',
        accessRole: 'customer-support',
        requireTwoFactor: false,
        invitationSent: false,
      }),
    } as unknown as SupabaseAdminUserAccessRepository;
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      { sendInvitation: jest.fn() },
    );

    const user = await service.updateUserAccess('admin-1', {
      accessRole: 'customer-support',
      requireTwoFactor: false,
    });

    expect(userClient.listUsers).toHaveBeenCalledWith('admin', null, 'admin-1');
    expect(accessRepository.upsertAccess).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      accessRole: 'customer-support',
      requireTwoFactor: false,
      invitationSent: undefined,
    });
    expect(user).toEqual(
      expect.objectContaining({
        id: 'admin-1',
        accessRole: 'customer-support',
        permissions: expect.arrayContaining(['support.manage']),
      }),
    );
  });

  it('deletes a non-final admin through auth-service and clears access metadata', async () => {
    const userClient = {
      listUsers: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'admin-2',
            email: 'ops@example.com',
            fullName: 'Ops Admin',
            contactNumber: null,
            role: 'admin',
            status: 'active',
            createdAt: '2026-05-17T00:00:00.000Z',
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'admin-1',
            email: 'root@example.com',
            fullName: 'Root Admin',
            contactNumber: null,
            role: 'admin',
            status: 'active',
            createdAt: '2026-05-16T00:00:00.000Z',
          },
          {
            id: 'admin-2',
            email: 'ops@example.com',
            fullName: 'Ops Admin',
            contactNumber: null,
            role: 'admin',
            status: 'active',
            createdAt: '2026-05-17T00:00:00.000Z',
          },
        ]),
    } as unknown as UserServiceClient;
    const authServiceClient = {
      deleteAdminUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthServiceClient;
    const accessRepository = {
      getAccessByUserIds: jest.fn().mockResolvedValue(
        new Map([
          [
            'admin-1',
            {
              adminUserId: 'admin-1',
              accessRole: 'super-admin',
              requireTwoFactor: true,
              invitationSent: true,
            },
          ],
          [
            'admin-2',
            {
              adminUserId: 'admin-2',
              accessRole: 'operations-manager',
              requireTwoFactor: false,
              invitationSent: true,
            },
          ],
        ]),
      ),
      deleteAccess: jest.fn().mockResolvedValue(undefined),
    } as unknown as SupabaseAdminUserAccessRepository;
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      { sendInvitation: jest.fn() },
    );

    const deleted = await service.deleteUser('admin-2');

    expect(userClient.listUsers).toHaveBeenNthCalledWith(
      1,
      'admin',
      null,
      'admin-2',
    );
    expect(authServiceClient.deleteAdminUser).toHaveBeenCalledWith('admin-2');
    expect(accessRepository.deleteAccess).toHaveBeenCalledWith('admin-2');
    expect(deleted).toEqual(
      expect.objectContaining({
        id: 'admin-2',
        accessRole: 'operations-manager',
      }),
    );
  });

  it('rejects deleting the last active super admin', async () => {
    const userClient = {
      listUsers: jest
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'admin-1',
            email: 'root@example.com',
            fullName: 'Root Admin',
            contactNumber: null,
            role: 'admin',
            status: 'active',
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'admin-1',
            email: 'root@example.com',
            fullName: 'Root Admin',
            contactNumber: null,
            role: 'admin',
            status: 'active',
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        ]),
    } as unknown as UserServiceClient;
    const authServiceClient = {
      deleteAdminUser: jest.fn(),
    } as unknown as AuthServiceClient;
    const accessRepository = {
      getAccessByUserIds: jest.fn().mockResolvedValue(
        new Map([
          [
            'admin-1',
            {
              adminUserId: 'admin-1',
              accessRole: 'super-admin',
              requireTwoFactor: true,
              invitationSent: true,
            },
          ],
        ]),
      ),
      deleteAccess: jest.fn(),
    } as unknown as SupabaseAdminUserAccessRepository;
    const service = new AdminUsersGatewayService(
      userClient,
      authServiceClient,
      accessRepository,
      { sendInvitation: jest.fn() },
    );

    await expect(service.deleteUser('admin-1')).rejects.toMatchObject({
      status: 400,
      code: 'last_super_admin_delete_forbidden',
    });
    expect(authServiceClient.deleteAdminUser).not.toHaveBeenCalled();
    expect(accessRepository.deleteAccess).not.toHaveBeenCalled();
  });
});
