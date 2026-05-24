import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  AdminDependencyUnavailableError,
  AdminRequiredError,
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminCatalogGatewayService } from './admin-catalog.service';
import {
  AdminCategoryItem,
  AdminServiceItem,
  UpsertCategoryRequest,
  UpsertServiceRequest,
} from './admin-catalog.types';

type AuditRequest = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

@Controller('v1/admin/catalog')
export class AdminCatalogController {
  private readonly logger = new Logger(AdminCatalogController.name);

  constructor(
    private readonly adminCatalogGatewayService: AdminCatalogGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get('categories')
  async listCategories(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: AdminCategoryItem[] }> {
    try {
      await this.requireAdmin(authorization);
      return { data: await this.adminCatalogGatewayService.listCategories() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('categories')
  async createCategory(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Body() body: UpsertCategoryRequest,
  ): Promise<{ data: AdminCategoryItem }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.name?.trim()) throw new InvalidAdminRequestError();
      const category =
        await this.adminCatalogGatewayService.createCategory(body);
      void this.audit(admin, request, {
        action: `Created category ${category.name}`,
        actionType: 'create',
        entityType: 'Category',
        entityId: category.id,
        details: `Category ${category.name} created.`,
        metadata: { categoryId: category.id, name: category.name },
      });
      return { data: category };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('categories/:id')
  async updateCategory(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('id') id: string,
    @Body() body: UpsertCategoryRequest,
  ): Promise<{ data: AdminCategoryItem }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const category = await this.adminCatalogGatewayService.updateCategory(
        id,
        body,
      );
      void this.audit(admin, request, {
        action: `Updated category ${category.name}`,
        actionType: 'update',
        entityType: 'Category',
        entityId: category.id,
        details: `Category ${category.name} updated.`,
        metadata: { categoryId: category.id },
      });
      return { data: category };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('categories/:id')
  @HttpCode(204)
  async deleteCategory(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      const admin = await this.requireAdmin(authorization);
      await this.adminCatalogGatewayService.deleteCategory(id);
      void this.audit(admin, request, {
        action: `Deleted category ${id}`,
        actionType: 'delete',
        entityType: 'Category',
        entityId: id,
        details: `Category ${id} deleted.`,
        metadata: { categoryId: id },
      });
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('services')
  async listServices(
    @Headers('authorization') authorization: string | undefined,
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: AdminServiceItem[] }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminCatalogGatewayService.listServices(
          categoryId ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('services')
  async createService(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Body() body: UpsertServiceRequest,
  ): Promise<{ data: AdminServiceItem }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.name?.trim()) throw new InvalidAdminRequestError();
      const service = await this.adminCatalogGatewayService.createService(body);
      void this.audit(admin, request, {
        action: `Created service ${service.name}`,
        actionType: 'create',
        entityType: 'Service',
        entityId: service.id,
        details: `Service ${service.name} created.`,
        metadata: { serviceId: service.id, name: service.name },
      });
      return { data: service };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('services/:id')
  async updateService(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('id') id: string,
    @Body() body: UpsertServiceRequest,
  ): Promise<{ data: AdminServiceItem }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const service = await this.adminCatalogGatewayService.updateService(
        id,
        body,
      );
      void this.audit(admin, request, {
        action: `Updated service ${service.name}`,
        actionType: 'update',
        entityType: 'Service',
        entityId: service.id,
        details: `Service ${service.name} updated.`,
        metadata: { serviceId: service.id },
      });
      return { data: service };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('services/:id')
  @HttpCode(204)
  async deleteService(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      const admin = await this.requireAdmin(authorization);
      await this.adminCatalogGatewayService.deleteService(id);
      void this.audit(admin, request, {
        action: `Deleted service ${id}`,
        actionType: 'delete',
        entityType: 'Service',
        entityId: id,
        details: `Service ${id} deleted.`,
        metadata: { serviceId: id },
      });
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') throw new AdminRequiredError();
    return currentUser;
  }

  private audit(
    admin: CurrentUserProfile,
    request: AuditRequest,
    input: {
      action: string;
      actionType: 'create' | 'update' | 'delete';
      entityType: string;
      entityId: string;
      details: string;
      metadata: Record<string, unknown>;
    },
  ): Promise<unknown> {
    return this.adminAuditGatewayService
      .createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: input.action,
        actionType: input.actionType,
        entityType: input.entityType,
        entityId: input.entityId,
        details: input.details,
        ipAddress: this.getClientIp(request),
        metadata: input.metadata,
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not create catalog audit log for ${input.entityType} ${input.entityId}: ${this.errorMessage(error)}`,
        );
      });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private getClientIp(request: AuditRequest): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? null;
    return (
      forwardedFor?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      null
    );
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError)
      return this.error('auth_required', 'Authentication is required.', 401);
    if (error instanceof InvalidAuthTokenError)
      return this.error(
        'invalid_auth_token',
        'Authentication token is invalid.',
        401,
      );
    if (error instanceof AdminRequiredError)
      return this.error('admin_required', 'An admin account is required.', 403);
    if (error instanceof InvalidAdminRequestError)
      return this.error(
        'invalid_admin_request',
        'Admin request is invalid.',
        400,
      );
    if (error instanceof AdminServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }

    if (error instanceof AdminDependencyUnavailableError)
      return this.error(
        'admin_dependency_unavailable',
        'Admin service is unavailable.',
        503,
      );
    return this.error(
      'admin_dependency_unavailable',
      'Admin request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
