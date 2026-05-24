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
import { AdminProviderSummary } from './admin-catalog.types';
import { CatalogServiceClient as CatalogBrowseServiceClient } from '../catalog/clients/catalog-service.client';
import { ProviderPortfolioMediaSummary } from '../catalog/catalog.types';

const validProviderStatuses = new Set([
  'active',
  'suspended',
  'verified',
  'unverified',
  'rejected',
]);

type AuditRequest = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

@Controller('v1/admin/providers')
export class AdminProvidersController {
  private readonly logger = new Logger(AdminProvidersController.name);

  constructor(
    private readonly adminCatalogGatewayService: AdminCatalogGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly catalogBrowseServiceClient: CatalogBrowseServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminProviderSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validProviderStatuses.has(status))
        throw new InvalidAdminRequestError();
      return {
        data: await this.adminCatalogGatewayService.listProviders(
          status ?? null,
          query ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':providerId')
  async get(
    @Headers('authorization') authorization: string | undefined,
    @Param('providerId') providerId: string,
  ): Promise<{ data: AdminProviderSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminCatalogGatewayService.getProvider(providerId),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':providerId/status')
  async updateStatus(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('providerId') providerId: string,
    @Body() body: { status?: string; reason?: string | null },
  ): Promise<{ data: AdminProviderSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.status || !validProviderStatuses.has(body.status))
        throw new InvalidAdminRequestError();
      const provider =
        await this.adminCatalogGatewayService.updateProviderStatus(
          providerId,
          body.status,
          body.reason ?? null,
        );
      void this.adminAuditGatewayService
        .createAuditLog({
          adminUserId: admin.user.id,
          adminEmail: admin.user.email,
          adminName: admin.user.fullName,
          action: `Updated provider status to ${body.status}`,
          actionType: 'update',
          entityType: 'Provider',
          entityId: provider.id,
          details: `Provider ${provider.id} status updated to ${body.status}.`,
          ipAddress: this.getClientIp(request),
          metadata: {
            providerId: provider.id,
            status: body.status,
            reason: body.reason ?? null,
          },
        })
        .catch((error: unknown) => {
          this.logAuditFailure(
            `provider status update ${provider.id}`,
            error,
          );
        });
      return { data: provider };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':providerId/portfolio')
  async listPortfolio(
    @Headers('authorization') authorization: string | undefined,
    @Param('providerId') providerId: string,
  ): Promise<{ data: ProviderPortfolioMediaSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.catalogBrowseServiceClient.listProviderPortfolio(
          providerId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':providerId/portfolio/:mediaId')
  @HttpCode(204)
  async deletePortfolioMedia(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('providerId') providerId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    try {
      const admin = await this.requireAdmin(authorization);
      const provider =
        await this.adminCatalogGatewayService.getProvider(providerId);
      await this.catalogBrowseServiceClient.deleteProviderPortfolioMedia(
        provider.userId,
        mediaId,
      );
      void this.adminAuditGatewayService
        .createAuditLog({
          adminUserId: admin.user.id,
          adminEmail: admin.user.email,
          adminName: admin.user.fullName,
          action: 'Removed provider portfolio media',
          actionType: 'delete',
          entityType: 'ProviderPortfolioMedia',
          entityId: mediaId,
          details: `Admin removed portfolio media ${mediaId} from provider ${providerId}.`,
          ipAddress: this.getClientIp(request),
          metadata: { providerId, mediaId },
        })
        .catch((error: unknown) => {
          this.logAuditFailure(
            `provider portfolio media deletion ${mediaId}`,
            error,
          );
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

  private getClientIp(request: AuditRequest): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? null;
    return (
      forwardedFor?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      null
    );
  }

  private logAuditFailure(context: string, error: unknown): void {
    this.logger.warn(
      `Could not create admin provider audit log for ${context}: ${this.errorMessage(error)}`,
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
