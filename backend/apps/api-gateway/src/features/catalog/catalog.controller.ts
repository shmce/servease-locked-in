import { Controller, Get, HttpException, Query } from '@nestjs/common';
import {
  CatalogDependencyUnavailableError,
  InvalidCatalogFilterError,
} from './catalog.errors';
import { CatalogGatewayService } from './catalog.service';
import {
  CatalogCategory,
  CatalogServiceItem,
  ProviderServiceListing,
} from './catalog.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('v1/catalog')
export class CatalogController {
  constructor(private readonly catalogGatewayService: CatalogGatewayService) {}

  @Get('categories')
  async categories(): Promise<{ data: CatalogCategory[] }> {
    try {
      return {
        data: await this.catalogGatewayService.listCategories(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('services')
  async services(
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: CatalogServiceItem[] }> {
    try {
      this.validateOptionalUuid(categoryId);
      return {
        data: await this.catalogGatewayService.listServices(categoryId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('providers')
  async providers(
    @Query('serviceId') serviceId?: string,
  ): Promise<{ data: ProviderServiceListing[] }> {
    try {
      this.validateOptionalUuid(serviceId);
      return {
        data: await this.catalogGatewayService.listProviderListings(serviceId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validateOptionalUuid(value?: string): void {
    if (value && !UUID_PATTERN.test(value)) {
      throw new InvalidCatalogFilterError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidCatalogFilterError) {
      return new HttpException(
        {
          error: {
            code: 'invalid_catalog_filter',
            message: 'Catalog filter is invalid.',
            details: {},
          },
        },
        400,
      );
    }

    if (error instanceof CatalogDependencyUnavailableError) {
      return new HttpException(
        {
          error: {
            code: 'catalog_dependency_unavailable',
            message: 'Catalog service is unavailable.',
            details: {},
          },
        },
        503,
      );
    }

    return new HttpException(
      {
        error: {
          code: 'catalog_dependency_unavailable',
          message: 'Catalog lookup failed.',
          details: {},
        },
      },
      503,
    );
  }
}
