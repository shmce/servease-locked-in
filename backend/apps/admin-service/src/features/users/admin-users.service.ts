import { Injectable } from '@nestjs/common';
import { UserServiceClient } from './clients/user-service.client';
import { AdminUserSummary, AdminUsersSummaryStats } from './admin-users.types';

@Injectable()
export class AdminUsersGatewayService {
  constructor(private readonly client: UserServiceClient) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.client.getSummary();
  }

  listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    return this.client.listUsers(role ?? null, status ?? null, query ?? null);
  }

  updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    return this.client.updateUserStatus(userId, status);
  }
}
