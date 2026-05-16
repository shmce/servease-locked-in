import { Injectable } from '@nestjs/common';
import { SupabaseAdminUserRepository } from './supabase-admin-user.repository';
import { AdminUserSummary, AdminUsersSummaryStats } from './admin-user.types';

const validRoles = new Set(['customer', 'provider', 'admin']);
const validStatuses = new Set(['active', 'suspended', 'inactive']);

@Injectable()
export class AdminUserService {
  constructor(private readonly repo: SupabaseAdminUserRepository) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.repo.getSummary();
  }

  listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    if (role && !validRoles.has(role)) {
      throw new Error('invalid_user_request');
    }
    if (status && !validStatuses.has(status)) {
      throw new Error('invalid_user_request');
    }
    return this.repo.listUsers(role ?? null, status ?? null, query ?? null);
  }

  async updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    if (!userId || !validStatuses.has(status)) {
      throw new Error('invalid_user_request');
    }
    return this.repo.updateUserStatus(userId, status);
  }
}
