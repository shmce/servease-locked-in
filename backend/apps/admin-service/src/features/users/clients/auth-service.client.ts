import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminUserSummary, CreateAdminUserRequest } from '../admin-users.types';

@Injectable()
export class AuthServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createAdminUser(input: CreateAdminUserRequest): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>('/internal/auth/admin-users', 'POST', {
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      contactNumber: input.contactNumber ?? null,
    });
  }

  private async request<T>(
    path: string,
    method: 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:8501',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('auth_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
