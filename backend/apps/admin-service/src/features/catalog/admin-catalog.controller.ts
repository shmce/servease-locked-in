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
import { AdminCatalogGatewayService } from './admin-catalog.service';
import {
  AdminCategoryItem,
  AdminProviderSummary,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

@Controller('internal/admin/catalog')
export class AdminCatalogController {
  constructor(private readonly adminCatalogService: AdminCatalogGatewayService) {}

  @Get('categories')
  async listCategories(): Promise<{ data: AdminCategoryItem[] }> {
    try {
      return { data: await this.adminCatalogService.listCategories() };
    } catch {
      throw this.unavailable();
    }
  }

  @Post('categories')
  async createCategory(@Body() body: UpsertCategoryRequest): Promise<{ data: AdminCategoryItem }> {
    try {
      return { data: await this.adminCatalogService.createCategory(body) };
    } catch {
      throw this.unavailable();
    }
  }

  @Patch('categories/:categoryId')
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() body: UpsertCategoryRequest,
  ): Promise<{ data: AdminCategoryItem }> {
    try {
      return { data: await this.adminCatalogService.updateCategory(categoryId, body) };
    } catch {
      throw this.unavailable();
    }
  }

  @Delete('categories/:categoryId')
  @HttpCode(204)
  async deleteCategory(@Param('categoryId') categoryId: string): Promise<void> {
    try {
      await this.adminCatalogService.deleteCategory(categoryId);
    } catch {
      throw this.unavailable();
    }
  }

  @Get('services')
  async listServices(
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: AdminServiceItem[] }> {
    try {
      return { data: await this.adminCatalogService.listServices(categoryId ?? null) };
    } catch {
      throw this.unavailable();
    }
  }

  @Post('services')
  async createService(@Body() body: UpsertServiceRequest): Promise<{ data: AdminServiceItem }> {
    try {
      return { data: await this.adminCatalogService.createService(body) };
    } catch {
      throw this.unavailable();
    }
  }

  @Patch('services/:serviceId')
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() body: UpsertServiceRequest,
  ): Promise<{ data: AdminServiceItem }> {
    try {
      return { data: await this.adminCatalogService.updateService(serviceId, body) };
    } catch {
      throw this.unavailable();
    }
  }

  @Delete('services/:serviceId')
  @HttpCode(204)
  async deleteService(@Param('serviceId') serviceId: string): Promise<void> {
    try {
      await this.adminCatalogService.deleteService(serviceId);
    } catch {
      throw this.unavailable();
    }
  }

  @Get('providers')
  async listProviders(
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminProviderSummary[] }> {
    try {
      return { data: await this.adminCatalogService.listProviders(status ?? null, query ?? null) };
    } catch {
      throw this.unavailable();
    }
  }

  @Get('providers/:providerId')
  async getProvider(@Param('providerId') providerId: string): Promise<{ data: AdminProviderSummary }> {
    try {
      return { data: await this.adminCatalogService.getProvider(providerId) };
    } catch {
      throw this.unavailable();
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
    } catch {
      throw this.unavailable();
    }
  }

  private unavailable(): HttpException {
    return new HttpException(
      { error: { code: 'catalog_dependency_unavailable', message: 'Catalog service is unavailable.', details: {} } },
      503,
    );
  }
}
