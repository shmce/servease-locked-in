import { Injectable } from '@nestjs/common';
import { AdminServiceClient } from './clients/admin-service.client';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

@Injectable()
export class AdminCatalogGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listCategories(): Promise<AdminCategoryItem[]> {
    return this.adminServiceClient.listAdminCategories();
  }

  createCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.adminServiceClient.createAdminCategory(req);
  }

  updateCategory(id: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    return this.adminServiceClient.updateAdminCategory(id, req);
  }

  deleteCategory(id: string): Promise<void> {
    return this.adminServiceClient.deleteAdminCategory(id);
  }

  listServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    return this.adminServiceClient.listAdminServices(categoryId ?? null);
  }

  createService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.adminServiceClient.createAdminService(req);
  }

  updateService(id: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    return this.adminServiceClient.updateAdminService(id, req);
  }

  deleteService(id: string): Promise<void> {
    return this.adminServiceClient.deleteAdminService(id);
  }

  listProviders(status?: string | null, query?: string | null): Promise<AdminProviderSummary[]> {
    return this.adminServiceClient.listAdminProviders(status ?? null, query ?? null);
  }

  getProvider(providerId: string): Promise<AdminProviderSummary> {
    return this.adminServiceClient.getAdminProvider(providerId);
  }

  updateProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary> {
    return this.adminServiceClient.updateAdminProviderStatus(providerId, status, reason ?? null);
  }
}
