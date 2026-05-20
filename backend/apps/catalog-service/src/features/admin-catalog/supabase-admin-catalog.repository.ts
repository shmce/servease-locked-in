import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceAreaSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceAreaRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

interface SupabaseRpcClient {
  rpc(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }> & {
    maybeSingle(): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  };
}

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

interface ServiceRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  pricing_mode: 'flat' | 'hourly';
  is_active: boolean;
}

interface ServiceAreaRow {
  id: string;
  name: string;
  city: string;
  region: string;
  status: 'active' | 'inactive';
  notes: string | null;
  polygon?: unknown;
  latitude: string | number | null;
  longitude: string | number | null;
  provider_count: string | number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProviderRow {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  service_description: string | null;
  service_area: string | null;
  years_experience: number | null;
  verification_status: string;
  average_rating: number;
  review_count: number;
  total_bookings?: string | number | null;
  completion_rate?: string | number | null;
  is_active: boolean;
  created_at: string | null;
  approved_by_user_id?: string | null;
  approved_by_name?: string | null;
  user_email: string | null;
  user_full_name: string | null;
  user_contact_number?: string | null;
  user_status: string | null;
}

@Injectable()
export class SupabaseAdminCatalogRepository {
  private readonly client: SupabaseRpcClient;

  constructor(client?: SupabaseRpcClient) {
    this.client = client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async listCategories(): Promise<AdminCategoryItem[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_catalog_categories');
    if (error) throw new Error(`Failed to list categories: ${error.message}`);
    return ((data as CategoryRow[]) ?? []).map(this.mapCategory);
  }

  async createCategory(req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_catalog_category', {
        p_name: req.name,
        p_description: req.description ?? null,
        p_icon: req.icon ?? null,
        p_sort_order: req.sortOrder ?? 0,
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return this.mapCategory(data as CategoryRow);
  }

  async updateCategory(id: string, req: UpsertCategoryRequest): Promise<AdminCategoryItem> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_catalog_category', {
        p_id: id,
        p_name: req.name,
        p_description: req.description ?? null,
        p_icon: req.icon ?? null,
        p_is_active: req.isActive ?? true,
        p_sort_order: req.sortOrder ?? 0,
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to update category: ${error.message}`);
    return this.mapCategory(data as CategoryRow);
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.client.rpc('servease_admin_delete_catalog_category', {
      p_id: id,
    });
    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }

  async listAdminServices(categoryId?: string | null): Promise<AdminServiceItem[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_catalog_services', {
      p_category_id: categoryId ?? null,
    });
    if (error) throw new Error(`Failed to list services: ${error.message}`);
    return ((data as ServiceRow[]) ?? []).map(this.mapService);
  }

  async createService(req: UpsertServiceRequest): Promise<AdminServiceItem> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_catalog_service', {
        p_category_id: req.categoryId ?? null,
        p_name: req.name,
        p_description: req.description ?? null,
        p_price: req.price ?? null,
        p_pricing_mode: req.pricingMode ?? 'flat',
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to create service: ${error.message}`);
    return this.mapService(data as ServiceRow);
  }

  async updateService(id: string, req: UpsertServiceRequest): Promise<AdminServiceItem> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_catalog_service', {
        p_id: id,
        p_name: req.name,
        p_description: req.description ?? null,
        p_price: req.price ?? null,
        p_pricing_mode: req.pricingMode ?? 'flat',
        p_is_active: req.isActive ?? true,
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to update service: ${error.message}`);
    return this.mapService(data as ServiceRow);
  }

  async deleteService(id: string): Promise<void> {
    const { error } = await this.client.rpc('servease_admin_delete_catalog_service', {
      p_id: id,
    });
    if (error) throw new Error(`Failed to delete service: ${error.message}`);
  }

  async listServiceAreas(): Promise<AdminServiceAreaSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_service_areas');
    if (error) throw new Error(`Failed to list service areas: ${error.message}`);
    return ((data as ServiceAreaRow[]) ?? []).map(this.mapServiceArea);
  }

  async createServiceArea(
    req: UpsertServiceAreaRequest,
  ): Promise<AdminServiceAreaSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_create_service_area', {
        p_name: req.name,
        p_city: req.city,
        p_region: req.region,
        p_status: req.status,
        p_notes: req.notes ?? null,
        p_polygon: req.polygon ?? null,
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to create service area: ${error.message}`);
    return this.mapServiceArea(data as ServiceAreaRow);
  }

  async updateServiceArea(
    id: string,
    req: Partial<UpsertServiceAreaRequest>,
  ): Promise<AdminServiceAreaSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_service_area', {
        p_id: id,
        p_name: req.name ?? null,
        p_city: req.city ?? null,
        p_region: req.region ?? null,
        p_status: req.status ?? null,
        p_notes: req.notes ?? null,
        p_polygon: req.polygon ?? null,
      })
      .maybeSingle();

    if (error) throw new Error(`Failed to update service area: ${error.message}`);
    return this.mapServiceArea(data as ServiceAreaRow);
  }

  async deleteServiceArea(id: string): Promise<void> {
    const { error } = await this.client.rpc('servease_admin_delete_service_area', {
      p_id: id,
    });
    if (error) throw new Error(`Failed to delete service area: ${error.message}`);
  }

  async listProviders(
    status?: string | null,
    query?: string | null,
  ): Promise<AdminProviderSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_providers', {
      p_status: status ?? null,
      p_query: query ?? null,
      p_limit: 200,
    });
    if (error) throw new Error(`Failed to list providers: ${error.message}`);
    return ((data as ProviderRow[]) ?? []).map(this.mapProvider);
  }

  async getProvider(providerId: string): Promise<AdminProviderSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_provider', { p_provider_id: providerId })
      .maybeSingle();
    if (error) throw new Error(`Failed to get provider: ${error.message}`);
    if (!data) return null;
    return this.mapProvider(data as ProviderRow);
  }

  async updateProviderStatus(
    providerId: string,
    status: string,
    reason?: string | null,
  ): Promise<AdminProviderSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_provider_status', {
        p_provider_id: providerId,
        p_status: status,
        p_reason: reason ?? null,
      })
      .maybeSingle();
    if (error) throw new Error(`Failed to update provider status: ${error.message}`);
    if (!data) return null;
    return this.mapProvider(data as ProviderRow);
  }

  private mapCategory(row: CategoryRow): AdminCategoryItem {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      isActive: row.is_active,
      sortOrder: row.sort_order,
    };
  }

  private mapService(row: ServiceRow): AdminServiceItem {
    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: row.price === null ? null : Number(row.price),
      pricingMode: row.pricing_mode,
      isActive: row.is_active,
    };
  }

  private mapServiceArea(row: ServiceAreaRow): AdminServiceAreaSummary {
    return {
      id: row.id,
      name: row.name,
      city: row.city,
      region: row.region,
      status: row.status,
      notes: row.notes,
      providerCount: Number(row.provider_count ?? 0),
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude),
      polygon: row.polygon ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapProvider(row: ProviderRow): AdminProviderSummary {
    return {
      id: row.id,
      userId: row.user_id,
      businessName: row.business_name,
      bio: row.bio,
      serviceDescription: row.service_description,
      serviceArea: row.service_area,
      yearsExperience: row.years_experience,
      verificationStatus: row.verification_status,
      averageRating: Number(row.average_rating ?? 0),
      reviewCount: Number(row.review_count ?? 0),
      totalBookings:
        row.total_bookings === null || row.total_bookings === undefined
          ? null
          : Number(row.total_bookings),
      completionRate:
        row.completion_rate === null || row.completion_rate === undefined
          ? null
          : Number(row.completion_rate),
      isActive: row.is_active,
      createdAt: row.created_at,
      approvedByUserId: row.approved_by_user_id ?? null,
      approvedByName: row.approved_by_name ?? null,
      userEmail: row.user_email,
      userFullName: row.user_full_name,
      userContactNumber: row.user_contact_number ?? null,
      userStatus: row.user_status,
    };
  }
}
