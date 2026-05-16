import { Injectable } from '@nestjs/common';
import { CatalogAdminServiceClient } from './clients/catalog-admin-service.client';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

@Injectable()
export class AdminCatalogGatewayService {
  constructor(private readonly client: CatalogAdminServiceClient) {}

  listCategories(): Promise<AdminCategoryItem[]> {
    return this.client.listCategories();
  }

  createCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.client.createCategory(req);
  }

  updateCategory(id: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.client.updateCategory(id, req);
  }

  deleteCategory(id: string): Promise<void> {
    return this.client.deleteCategory(id);
  }

  listServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    return this.client.listServices(categoryId ?? null);
  }

  createService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.client.createService(req);
  }

  updateService(id: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.client.updateService(id, req);
  }

  deleteService(id: string): Promise<void> {
    return this.client.deleteService(id);
  }

  listProviders(status?: string | null, query?: string | null): Promise<AdminProviderSummary[]> {
    return this.client.listProviders(status ?? null, query ?? null);
  }

  getProvider(providerId: string): Promise<AdminProviderSummary> {
    return this.client.getProvider(providerId);
  }

  updateProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary> {
    return this.client.updateProviderStatus(providerId, status, reason ?? null);
  }
}
