import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminUserSummary, AdminUsersSummaryStats } from '../admin-users.types';
import { AdminUserRequestError } from '../admin-user.errors';

@Injectable()
export class UserServiceClient {
  constructor(private readonly configService: ConfigService) {}

  getSummary(): Promise<AdminUsersSummaryStats> {
    return this.request<AdminUsersSummaryStats>('/internal/admin/users/summary', 'GET');
  }

  listUsers(role?: string | null, status?: string | null, query?: string | null): Promise<AdminUserSummary[]> {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    if (query) params.set('query', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<AdminUserSummary[]>(`/internal/admin/users${qs}`, 'GET');
  }

  updateUserStatus(userId: string, status: string): Promise<AdminUserSummary> {
    return this.request<AdminUserSummary>(
      `/internal/admin/users/${encodeURIComponent(userId)}/status`,
      'PATCH',
      { status },
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'PATCH',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:8502',
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
      throw new Error('user_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
