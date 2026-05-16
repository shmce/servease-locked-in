import { Injectable } from '@nestjs/common';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderServiceListing,
} from './catalog-browse.types';
import { SupabaseCatalogBrowseRepository } from './supabase-catalog-browse.repository';

@Injectable()
export class CatalogBrowseService {
  constructor(
    private readonly catalogBrowseRepository: SupabaseCatalogBrowseRepository,
  ) {}

  listCategories(): Promise<CatalogCategory[]> {
    return this.catalogBrowseRepository.listCategories();
  }

  listServices(categoryId?: string): Promise<CatalogServiceItem[]> {
    return this.catalogBrowseRepository.listServices(categoryId);
  }

  listProviderListings(
    serviceId?: string,
    providerId?: string,
  ): Promise<ProviderServiceListing[]> {
    return this.catalogBrowseRepository.listProviderListings(
      serviceId,
      providerId,
    );
  }
}
