import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminCatalogService } from './admin-catalog.service';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

@Controller('internal/admin/catalog')
export class AdminCatalogController {
  constructor(private readonly adminCatalogService: AdminCatalogService) {}

  @Get('categories')
  async listCategories(): Promise<{ data: AdminCategoryItem[] }> {
    try {
      return { data: await this.adminCatalogService.listCategories() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('categories')
  async createCategory(@Body() body: UpsertCategoryRequest): Promise<{ data: AdminCategoryItem }> {
    try {
      return { data: await this.adminCatalogService.createCategory(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('categories/:categoryId')
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: UpsertCategoryRequest,
  ): Promise<{ data: AdminCategoryItem }> {
    try {
      return { data: await this.adminCatalogService.updateCategory(categoryId, body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('categories/:categoryId')
  @HttpCode(204)
  async deleteCategory(@Param('categoryId') categoryId: string): Promise<void> {
    try {
      await this.adminCatalogService.deleteCategory(categoryId);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('services')
  async listServices(
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: AdminServiceItem[] }> {
    try {
      return { data: await this.adminCatalogService.listAdminServices(categoryId ?? null) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('services')
  async createService(@Body() body: UpsertServiceRequest): Promise<{ data: AdminServiceItem }> {
    try {
      return { data: await this.adminCatalogService.createService(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('services/:serviceId')
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() body: UpsertServiceRequest,
  ): Promise<{ data: AdminServiceItem }> {
    try {
      return { data: await this.adminCatalogService.updateService(serviceId, body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('services/:serviceId')
  @HttpCode(204)
  async deleteService(@Param('serviceId') serviceId: string): Promise<void> {
    try {
      await this.adminCatalogService.deleteService(serviceId);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('providers')
  async listProviders(
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminProviderSummary[] }> {
    try {
      return { data: await this.adminCatalogService.listProviders(status ?? null, query ?? null) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('providers/:providerId')
  async getProvider(@Param('providerId') providerId: string): Promise<{ data: AdminProviderSummary }> {
    try {
      return { data: await this.adminCatalogService.getProvider(providerId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('providers/:providerId/status')
  async updateProviderStatus(
    @Param('providerId') providerId: string,
    @Body() body: { status?: string; reason?: string | null },
  ): Promise<{ data: AdminProviderSummary }> {
    try {
      return {
        data: await this.adminCatalogService.updateProviderStatus(
          providerId,
          body.status ?? '',
          body.reason ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'invalid_catalog_request') {
      return new HttpException({ error: { code: 'invalid_catalog_request', message: 'Catalog request is invalid.', details: {} } }, 400);
    }
    if (msg === 'invalid_provider_request') {
      return new HttpException({ error: { code: 'invalid_provider_request', message: 'Provider request is invalid.', details: {} } }, 400);
    }
    if (msg === 'provider_not_found') {
      return new HttpException({ error: { code: 'provider_not_found', message: 'Provider not found.', details: {} } }, 404);
    }
    return new HttpException({ error: { code: 'catalog_service_unavailable', message: 'Catalog service failed.', details: {} } }, 503);
  }
}
