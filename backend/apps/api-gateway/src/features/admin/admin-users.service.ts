import { Injectable } from '@nestjs/common';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
} from './admin-users.types';

@Injectable()
export class AdminUsersGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.adminServiceClient.getAdminUsersSummary();
  }

  listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    return this.adminServiceClient.listAdminUsers(role ?? null, status ?? null, query ?? null);
  }

  updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    return this.adminServiceClient.updateAdminUserStatus(userId, status);
  }

  createUser(input: CreateAdminUserRequest): Promise<AdminUserSummary> {
    return this.adminServiceClient.createAdminUser(input);
  }
}
