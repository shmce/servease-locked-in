import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminUserSummary, CreateAdminUserRequest } from '../admin-users.types';
import { AdminUserRequestError } from '../admin-user.errors';

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

  deleteAdminUser(userId: string): Promise<void> {
    return this.request<void>(
      `/internal/auth/registrations/${encodeURIComponent(userId)}`,
      'DELETE',
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'POST',
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
      if (response.status < 500) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: { code?: string; message?: string };
        };
        throw new AdminUserRequestError(
          response.status,
          payload.error?.code ?? 'admin_user_request_failed',
          payload.error?.message ?? 'Admin user request failed.',
        );
      }
      throw new Error('auth_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
