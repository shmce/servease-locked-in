import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from '../admin-catalog.types';

@Injectable()
export class CatalogAdminServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listCategories(): Promise<AdminCategoryItem[]> {
    return this.request<AdminCategoryItem[]>('/internal/admin/catalog/categories', 'GET');
  }

  createCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.request<AdminCategoryItem>('/internal/admin/catalog/categories', 'POST', req);
  }

  updateCategory(categoryId: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.request<AdminCategoryItem>(
      `/internal/admin/catalog/categories/${encodeURIComponent(categoryId)}`,
      'PATCH',
      req,
    );
  }

  deleteCategory(categoryId: string): Promise<void> {
    return this.request<void>(
      `/internal/admin/catalog/categories/${encodeURIComponent(categoryId)}`,
      'DELETE',
    );
  }

  listServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return this.request<AdminServiceItem[]>(`/internal/admin/catalog/services${qs}`, 'GET');
  }

  createService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.request<AdminServiceItem>('/internal/admin/catalog/services', 'POST', req);
  }

  updateService(serviceId: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.request<AdminServiceItem>(
      `/internal/admin/catalog/services/${encodeURIComponent(serviceId)}`,
      'PATCH',
      req,
    );
  }

  deleteService(serviceId: string): Promise<void> {
    return this.request<void>(
      `/internal/admin/catalog/services/${encodeURIComponent(serviceId)}`,
      'DELETE',
    );
  }

  listProviders(status?: string | null, query?: string | null): Promise<AdminProviderSummary[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (query) params.set('query', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<AdminProviderSummary[]>(`/internal/admin/catalog/providers${qs}`, 'GET');
  }

  getProvider(providerId: string): Promise<AdminProviderSummary> {
    return this.request<AdminProviderSummary>(
      `/internal/admin/catalog/providers/${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  updateProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary> {
    return this.request<AdminProviderSummary>(
      `/internal/admin/catalog/providers/${encodeURIComponent(providerId)}/status`,
      'PATCH',
      { status, reason },
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>('CATALOG_SERVICE_URL', 'http://localhost:8503');
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('catalog_dependency_unavailable');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
