import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { AdminUserSummary, AdminUsersSummaryStats, UserRole, UserStatus } from './admin-user.types';

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  contact_number: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string | null;
}

interface SupabaseClient {
  rpc(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }> & {
    maybeSingle(): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  };
}

@Injectable()
export class SupabaseAdminUserRepository {
  private readonly client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client ?? (createSupabaseServiceClient() as unknown as SupabaseClient);
  }

  async getSummary(): Promise<AdminUsersSummaryStats> {
    const { data, error } = await this.client.rpc('servease_admin_users_summary');

    if (error) {
      throw new Error(`Failed to get users summary: ${error.message}`);
    }

    const raw = data as Record<string, unknown>;
    const byRole = (raw.byRole ?? {}) as Record<string, number>;
    const byStatus = (raw.byStatus ?? {}) as Record<string, number>;

    return {
      totalCount: Number(raw.totalCount ?? 0),
      byRole: {
        customer: Number(byRole.customer ?? 0),
        provider: Number(byRole.provider ?? 0),
        admin: Number(byRole.admin ?? 0),
      },
      byStatus: {
        active: Number(byStatus.active ?? 0),
        suspended: Number(byStatus.suspended ?? 0),
        inactive: Number(byStatus.inactive ?? 0),
      },
      recentCount: Number(raw.recentCount ?? 0),
      newThisMonth: Number(raw.newThisMonth ?? 0),
    };
  }

  async listUsers(
    role?: string | null,
    status?: string | null,
    query?: string | null,
  ): Promise<AdminUserSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_users', {
      p_role: role ?? null,
      p_status: status ?? null,
      p_query: query ?? null,
      p_limit: 200,
    });

    if (error) {
      throw new Error(`Failed to list users: ${(error as { message: string }).message}`);
    }

    return ((data as UserRow[]) ?? []).map(this.mapUser);
  }

  async updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_user_status', {
        p_user_id: userId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update user status: ${(error as { message: string }).message}`);
    }

    return this.mapUser(data as UserRow);
  }

  private mapUser(row: UserRow): AdminUserSummary {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      contactNumber: row.contact_number,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
