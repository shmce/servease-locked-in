import { Injectable } from '@nestjs/common';
import { SupabaseAdminCatalogRepository } from './supabase-admin-catalog.repository';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

const validPricingModes = new Set(['flat', 'hourly']);
const validProviderStatuses = new Set(['pending', 'approved', 'rejected', 'suspended']);

@Injectable()
export class AdminCatalogService {
  constructor(private readonly repo: SupabaseAdminCatalogRepository) {}

  listCategories(): Promise<AdminCategoryItem[]> {
    return this.repo.listCategories();
  }

  createCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    if (!req.name?.trim()) throw new Error('invalid_catalog_request');
    return this.repo.createCategory(req);
  }

  updateCategory(id: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    if (!id || !req.name?.trim()) throw new Error('invalid_catalog_request');
    return this.repo.updateCategory(id, req);
  }

  deleteCategory(id: string): Promise<void> {
    if (!id) throw new Error('invalid_catalog_request');
    return this.repo.deleteCategory(id);
  }

  listAdminServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    return this.repo.listAdminServices(categoryId ?? null);
  }

  createService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    if (!req.name?.trim()) throw new Error('invalid_catalog_request');
    if (req.pricingMode && !validPricingModes.has(req.pricingMode)) throw new Error('invalid_catalog_request');
    return this.repo.createService(req);
  }

  updateService(id: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    if (!id || !req.name?.trim()) throw new Error('invalid_catalog_request');
    if (req.pricingMode && !validPricingModes.has(req.pricingMode)) throw new Error('invalid_catalog_request');
    return this.repo.updateService(id, req);
  }

  deleteService(id: string): Promise<void> {
    if (!id) throw new Error('invalid_catalog_request');
    return this.repo.deleteService(id);
  }

  listProviders(status?: string | null, query?: string | null): Promise<AdminProviderSummary[]> {
    if (status && !validProviderStatuses.has(status)) throw new Error('invalid_provider_request');
    return this.repo.listProviders(status ?? null, query ?? null);
  }

  async getProvider(providerId: string): Promise<AdminProviderSummary> {
    if (!providerId) throw new Error('invalid_provider_request');
    const provider = await this.repo.getProvider(providerId);
    if (!provider) throw new Error('provider_not_found');
    return provider;
  }

  async updateProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary> {
    if (!providerId || !validProviderStatuses.has(status)) throw new Error('invalid_provider_request');
    const provider = await this.repo.updateProviderStatus(providerId, status, reason ?? null);
    if (!provider) throw new Error('provider_not_found');
    return provider;
  }
}
