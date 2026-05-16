import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { UserServiceClient } from './clients/user-service.client';
import {
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
} from './admin-users.types';

@Injectable()
export class AdminUsersGatewayService {
  constructor(
    private readonly client: UserServiceClient,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.client.getSummary();
  }

  listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    return this.client.listUsers(role ?? null, status ?? null, query ?? null);
  }

  updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    return this.client.updateUserStatus(userId, status);
  }

  createUser(input: CreateAdminUserRequest): Promise<AdminUserSummary> {
    return this.authServiceClient.createAdminUser(input);
  }
}
