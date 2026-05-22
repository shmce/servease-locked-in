import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from './clients/catalog-service.client';
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

  listServiceAreas(): Promise<ServiceAreaSummary[]> {
    return this.catalogServiceClient.listServiceAreas();
  }

  listProviderListings(
    serviceId?: string,
    providerId?: string,
  ): Promise<ProviderServiceListing[]> {
    return this.catalogServiceClient.listProviderListings(serviceId, providerId);
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

  replaceProviderPortfolioMedia(
    userId: string,
    mediaId: string,
    input: ProviderPortfolioMediaReplacementInput,
  ): Promise<ProviderPortfolioMediaSummary> {
    return this.catalogServiceClient.replaceProviderPortfolioMedia(
      userId,
      mediaId,
      input,
    );
  }

  reorderProviderPortfolioMedia(
    userId: string,
    items: ProviderPortfolioOrderItem[],
  ): Promise<ProviderPortfolioMediaSummary[]> {
    return this.catalogServiceClient.reorderProviderPortfolioMedia(userId, items);
  }

  listProviderOwnedServices(
    userId: string,
  ): Promise<ProviderOwnedServiceSummary[]> {
    return this.catalogServiceClient.listProviderOwnedServices(userId);
  }

  replaceProviderOwnedServices(
    userId: string,
    services: ProviderOwnedServiceInput[],
  ): Promise<ProviderOwnedServiceSummary[]> {
    return this.catalogServiceClient.replaceProviderOwnedServices(userId, services);
  }
}
