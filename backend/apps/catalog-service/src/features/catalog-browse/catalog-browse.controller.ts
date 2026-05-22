import { Controller, Get, Query } from '@nestjs/common';
import { CatalogBrowseService } from './catalog-browse.service';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderServiceListing,
  ServiceAreaSummary,
} from './catalog-browse.types';

@Controller('internal/catalog')
export class CatalogBrowseController {
  constructor(private readonly catalogBrowseService: CatalogBrowseService) {}

  @Get('categories')
  async categories(): Promise<{ data: CatalogCategory[] }> {
    return {
      data: await this.catalogBrowseService.listCategories(),
    };
  }

  @Get('services')
  async services(
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: CatalogServiceItem[] }> {
    return {
      data: await this.catalogBrowseService.listServices(categoryId),
    };
  }

  @Get('service-areas')
  async serviceAreas(): Promise<{ data: ServiceAreaSummary[] }> {
    return {
      data: await this.catalogBrowseService.listServiceAreas(),
    };
  }

  @Get('providers')
  async providers(
    @Query('serviceId') serviceId?: string,
    @Query('providerId') providerId?: string,
  ): Promise<{ data: ProviderServiceListing[] }> {
    return {
      data: await this.catalogBrowseService.listProviderListings(
        serviceId,
        providerId,
      ),
    };
  }
}
