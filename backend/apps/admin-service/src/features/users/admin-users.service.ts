import { Inject, Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { getAdminAccessRoleDefinition } from './admin-access-roles';
import {
  AdminInvitationDeliveryService,
  AdminInvitationSender,
} from './admin-invitation-delivery.service';
import { AdminUserRequestError } from './admin-user.errors';
import {
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
  UpdateAdminUserAccessRequest,
} from './admin-users.types';
import {
  AdminUserAccessRecord,
  SupabaseAdminUserAccessRepository,
} from './supabase-admin-user-access.repository';

@Injectable()
export class AdminUsersGatewayService {
  constructor(
    private readonly client: UserServiceClient,
    private readonly authServiceClient: AuthServiceClient,
    private readonly accessRepository: SupabaseAdminUserAccessRepository,
    @Inject(AdminInvitationDeliveryService)
    private readonly invitationDeliveryService: AdminInvitationSender,
  ) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.client.getSummary();
  }

  async listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    const users = await this.client.listUsers(role ?? null, status ?? null, query ?? null);
    return this.enrichAdminUsers(users);
  }

  async updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    const user = await this.client.updateUserStatus(userId, status);
    const [enriched] = await this.enrichAdminUsers([user]);
    return enriched;
  }

  async createUser(input: CreateAdminUserRequest): Promise<AdminUserSummary> {
    const user = await this.authServiceClient.createAdminUser(input);
    if (user.role !== 'admin') return user;

    const invitationSent = input.sendInvitation
      ? await this.invitationDeliveryService.sendInvitation({
          email: input.email,
          fullName: input.fullName,
          temporaryPassword: input.password,
          accessRole: input.accessRole,
        })
      : false;

    const access = await this.accessRepository.upsertAccess({
      adminUserId: user.id,
      accessRole: input.accessRole,
      requireTwoFactor: input.requireTwoFactor,
      invitationSent,
    });

    return this.enrichUser(user, access);
  }

  async updateUserAccess(
    userId: string,
    input: UpdateAdminUserAccessRequest,
  ): Promise<AdminUserSummary> {
    const users = await this.client.listUsers('admin', null, userId);
    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new AdminUserRequestError(
        404,
        'admin_user_not_found',
        'Admin user was not found.',
      );
    }

    const access = await this.accessRepository.upsertAccess({
      adminUserId: userId,
      accessRole: input.accessRole,
      requireTwoFactor: input.requireTwoFactor,
      invitationSent: undefined,
    });

    return this.enrichUser(user, access);
  }

  async deleteUser(userId: string): Promise<AdminUserSummary> {
    const users = await this.client.listUsers('admin', null, userId);
    const user = users.find((item) => item.id === userId);
    if (!user) {
      throw new AdminUserRequestError(
        404,
        'admin_user_not_found',
        'Admin user was not found.',
      );
    }

    const [enriched] = await this.enrichAdminUsers([user]);
    await this.assertNotLastActiveSuperAdmin(enriched);

    await this.authServiceClient.deleteAdminUser(userId);
    await this.accessRepository.deleteAccess(userId);

    return enriched;
  }

  private async enrichAdminUsers(
    users: AdminUserSummary[],
  ): Promise<AdminUserSummary[]> {
    const adminUserIds = users
      .filter((user) => user.role === 'admin')
      .map((user) => user.id);
    const accessByUserId =
      await this.accessRepository.getAccessByUserIds(adminUserIds);

    return users.map((user) => this.enrichUser(user, accessByUserId.get(user.id)));
  }

  private enrichUser(
    user: AdminUserSummary,
    access?: AdminUserAccessRecord,
  ): AdminUserSummary {
    if (user.role !== 'admin') return user;

    const definition = getAdminAccessRoleDefinition(access?.accessRole);
    return {
      ...user,
      accessRole: definition.id,
      accessRoleLabel: definition.label,
      permissions: definition.permissions,
      requireTwoFactor: access?.requireTwoFactor ?? false,
      invitationSent: access?.invitationSent ?? false,
    };
  }

  private async assertNotLastActiveSuperAdmin(
    user: AdminUserSummary,
  ): Promise<void> {
    if (user.status !== 'active' || user.accessRole !== 'super-admin') {
      return;
    }

    const activeAdmins = await this.listUsers('admin', 'active', null);
    const activeSuperAdmins = activeAdmins.filter(
      (admin) => admin.accessRole === 'super-admin',
    );
    if (activeSuperAdmins.length <= 1) {
      throw new AdminUserRequestError(
        400,
        'last_super_admin_delete_forbidden',
        'The last active Super Admin cannot be deleted.',
      );
    }
  }
}
