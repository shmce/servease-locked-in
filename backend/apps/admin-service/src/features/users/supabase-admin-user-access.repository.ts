import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminAccessRoleId,
  normalizeAdminAccessRole,
} from './admin-access-roles';

export interface AdminUserAccessRecord {
  adminUserId: string;
  accessRole: AdminAccessRoleId;
  requireTwoFactor: boolean;
  invitationSent: boolean;
}

interface AdminUserAccessRow {
  admin_user_id: string;
  access_role: string;
  require_two_factor: boolean | null;
  invitation_sent: boolean | null;
}

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{
    data: AdminUserAccessRow[] | null;
    error: { message: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: AdminUserAccessRow | null;
      error: { message: string } | null;
    }>;
  };
}

@Injectable()
export class SupabaseAdminUserAccessRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async upsertAccess(input: {
    adminUserId: string;
    accessRole?: AdminAccessRoleId | null;
    requireTwoFactor?: boolean | null;
    invitationSent?: boolean | null;
  }): Promise<AdminUserAccessRecord> {
    const { data, error } = await this.client
      .rpc('servease_admin_upsert_user_access', {
        p_admin_user_id: input.adminUserId,
        p_access_role: normalizeAdminAccessRole(input.accessRole),
        p_require_two_factor: Boolean(input.requireTwoFactor),
        p_invitation_sent: Boolean(input.invitationSent),
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update admin user access: ${error.message}`);
    }
    if (!data) {
      throw new Error('Admin user access was not updated.');
    }

    return this.mapAccess(data);
  }

  async getAccessByUserIds(
    userIds: string[],
  ): Promise<Map<string, AdminUserAccessRecord>> {
    if (userIds.length === 0) return new Map();

    const { data, error } = await this.client.rpc(
      'servease_admin_list_user_access',
      {
        p_admin_user_ids: userIds,
      },
    );

    if (error) {
      throw new Error(`Failed to list admin user access: ${error.message}`);
    }

    return new Map(
      ((data ?? []) as AdminUserAccessRow[]).map((row) => {
        const access = this.mapAccess(row);
        return [access.adminUserId, access];
      }),
    );
  }

  async deleteAccess(adminUserId: string): Promise<void> {
    const { error } = await this.client.rpc('servease_admin_delete_user_access', {
      p_admin_user_id: adminUserId,
    });

    if (error) {
      throw new Error(`Failed to delete admin user access: ${error.message}`);
    }
  }

  private mapAccess(row: AdminUserAccessRow): AdminUserAccessRecord {
    return {
      adminUserId: row.admin_user_id,
      accessRole: normalizeAdminAccessRole(row.access_role),
      requireTwoFactor: Boolean(row.require_two_factor),
      invitationSent: Boolean(row.invitation_sent),
    };
  }
}
