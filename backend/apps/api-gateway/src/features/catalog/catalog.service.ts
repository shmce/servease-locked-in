import { Injectable } from '@nestjs/common';
import { CatalogServiceClient } from './clients/catalog-service.client';
import {
  CatalogCategory,
  CatalogServiceItem,
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
}
