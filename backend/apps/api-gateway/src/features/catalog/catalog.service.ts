import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from './clients/catalog-service.client';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderPortfolioMediaInput,
  ProviderPortfolioMediaSummary,
  ProviderServiceListing,
} from './catalog.types';

@Injectable()
export class CatalogGatewayService {
  constructor(private readonly catalogServiceClient: CatalogServiceClient) {}

  listCategories(): Promise<CatalogCategory[]> {
    return this.catalogServiceClient.listCategories();
  }

  listServices(categoryId?: string): Promise<CatalogServiceItem[]> {
    return this.catalogServiceClient.listServices(categoryId);
  }

  listProviderListings(serviceId?: string): Promise<ProviderServiceListing[]> {
    return this.catalogServiceClient.listProviderListings(serviceId);
  }

  listProviderPortfolio(
    providerId: string,
  ): Promise<ProviderPortfolioMediaSummary[]> {
    return this.catalogServiceClient.listProviderPortfolio(providerId);
  }

  addProviderPortfolioMedia(
    userId: string,
    input: ProviderPortfolioMediaInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    return this.catalogServiceClient.addProviderPortfolioMedia(userId, input);
  }

  deleteProviderPortfolioMedia(userId: string, mediaId: string): Promise<void> {
    return this.catalogServiceClient.deleteProviderPortfolioMedia(userId, mediaId);
  }
}
