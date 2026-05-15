import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogDependencyUnavailableError } from '../catalog.errors';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderServiceListing,
} from '../catalog.types';

@Injectable()
export class CatalogServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async listCategories(): Promise<CatalogCategory[]> {
    return this.get<CatalogCategory[]>('/internal/catalog/categories');
  }

  async listServices(categoryId?: string): Promise<CatalogServiceItem[]> {
    const search = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return this.get<CatalogServiceItem[]>(`/internal/catalog/services${search}`);
  }

  async listProviderListings(serviceId?: string): Promise<ProviderServiceListing[]> {
    const search = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
    return this.get<ProviderServiceListing[]>(
      `/internal/catalog/providers${search}`,
    );
  }

  private async get<T>(path: string): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'CATALOG_SERVICE_URL',
      'http://localhost:8503',
    );
    const response = await fetch(`${baseUrl}${path}`);

    if (!response.ok) {
      throw new CatalogDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
