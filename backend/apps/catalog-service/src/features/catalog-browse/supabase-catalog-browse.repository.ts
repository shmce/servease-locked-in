import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderServiceListing,
} from './catalog-browse.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args?: Record<string, string | null>,
  ): PromiseLike<{
    data: unknown[] | null;
    error: { message: string } | null;
  }>;
}

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface ServiceRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | string | null;
  pricing_mode: 'flat' | 'hourly';
}

interface ProviderListingRow {
  id: string;
  provider_id: string;
  provider_business_name: string | null;
  service_id: string | null;
  title: string;
  description: string | null;
  price: number | string | null;
  pricing_mode: 'flat' | 'hourly';
  average_rating: number | string | null;
  review_count: number | null;
  verification_status: 'pending' | 'approved' | 'rejected';
}

@Injectable()
export class SupabaseCatalogBrowseRepository {
  private readonly client: SupabaseRpcClient;

  constructor(client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async listCategories(): Promise<CatalogCategory[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_catalog_categories',
    );

    if (error) {
      throw new Error(`Failed to load catalog categories: ${error.message}`);
    }

    return ((data ?? []) as CategoryRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
    }));
  }

  async listServices(categoryId?: string): Promise<CatalogServiceItem[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_catalog_services',
      {
        p_category_id: categoryId ?? null,
      },
    );

    if (error) {
      throw new Error(`Failed to load catalog services: ${error.message}`);
    }

    return ((data ?? []) as ServiceRow[]).map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: row.price === null ? null : Number(row.price),
      pricingMode: row.pricing_mode,
    }));
  }

  async listProviderListings(
    serviceId?: string,
    providerId?: string,
  ): Promise<ProviderServiceListing[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_provider_service_listings',
      {
        p_service_id: serviceId ?? null,
        p_provider_id: providerId ?? null,
      },
    );

    if (error) {
      throw new Error(`Failed to load provider listings: ${error.message}`);
    }

    return ((data ?? []) as ProviderListingRow[]).map((row) => ({
      id: row.id,
      providerId: row.provider_id,
      providerBusinessName: row.provider_business_name,
      serviceId: row.service_id,
      title: row.title,
      description: row.description,
      price: row.price === null ? null : Number(row.price),
      pricingMode: row.pricing_mode,
      averageRating: Number(row.average_rating ?? 0),
      reviewCount: row.review_count ?? 0,
      verificationStatus: row.verification_status,
    }));
  }
}
