import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CatalogDependencyUnavailableError } from '../catalog.errors';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaReplacementInput,
  ProviderPortfolioOrderItem,
  ProviderPortfolioMediaSummary,
  ProviderServiceListing,
  ServiceAreaSummary,
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

  async listServiceAreas(): Promise<ServiceAreaSummary[]> {
    return this.get<ServiceAreaSummary[]>('/internal/catalog/service-areas');
  }

  async listProviderListings(
    serviceId?: string,
    providerId?: string,
  ): Promise<ProviderServiceListing[]> {
    const searchParams = new URLSearchParams();
    if (serviceId) {
      searchParams.set('serviceId', serviceId);
    }
    if (providerId) {
      searchParams.set('providerId', providerId);
    }
    const search = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
    return this.get<ProviderServiceListing[]>(
      `/internal/catalog/providers${search}`,
    );
  }

  async listProviderPortfolio(
    providerId: string,
  ): Promise<ProviderPortfolioMediaSummary[]> {
    return this.request<ProviderPortfolioMediaSummary[]>(
      `/internal/providers/${providerId}/portfolio`,
      'GET',
    );
  }

  async addProviderPortfolioMedia(
    userId: string,
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    return this.request<ProviderPortfolioMediaSummary>(
      '/internal/providers/portfolio',
      'POST',
      {
        userId,
        ...input,
      },
    );
  }

  async deleteProviderPortfolioMedia(
    userId: string,
    mediaId: string,
  ): Promise<void> {
    await this.request<void>(
      `/internal/providers/portfolio/${mediaId}`,
      'DELETE',
      { userId },
    );
  }

  async replaceProviderPortfolioMedia(
    userId: string,
    mediaId: string,
    input: ProviderPortfolioMediaReplacementInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    return this.request<ProviderPortfolioMediaSummary>(
      `/internal/providers/portfolio/${mediaId}`,
      'PUT',
      {
        userId,
        ...input,
      },
    );
  }

  async reorderProviderPortfolioMedia(
    userId: string,
    items: ProviderPortfolioOrderItem[],
  ): Promise<ProviderPortfolioMediaSummary[]> {
    return this.request<ProviderPortfolioMediaSummary[]>(
      '/internal/providers/portfolio/order',
      'PUT',
      { userId, items },
    );
  }

  async listProviderOwnedServices(
    userId: string,
  ): Promise<ProviderOwnedServiceSummary[]> {
    return this.request<ProviderOwnedServiceSummary[]>(
      `/internal/providers/by-user/${encodeURIComponent(userId)}/services`,
      'GET',
    );
  }

  async replaceProviderOwnedServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]> {
    return this.request<ProviderOwnedServiceSummary[]>(
      `/internal/providers/by-user/${encodeURIComponent(userId)}/services`,
      'PUT',
      { services },
    );
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>(path, 'GET');
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'CATALOG_SERVICE_URL',
      'http://localhost:8503',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new CatalogDependencyUnavailableError();
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
