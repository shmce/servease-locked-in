import { Body, Controller, Get, Headers, HttpCode, HttpException, Param, Post, Query, Req } from '@nestjs/common';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminProviderApplicationGatewayService } from './admin-provider-application.service';
import {
  AdminProviderApplicationSummary,
  ProviderApplicationStatus,
} from './admin-provider-application.types';
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
  InvalidAdminRequestError,
} from './admin-support.errors';

const validStatuses = new Set(['pending', 'approved', 'rejected']);

@Controller('v1/admin/provider-applications')
export class AdminProviderApplicationController {
  constructor(
    private readonly providerApplicationService: AdminProviderApplicationGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: ProviderApplicationStatus,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: AdminProviderApplicationSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.providerApplicationService.listProviderApplications({
          status: status ?? null,
          query: query ?? null,
          limit: limit ? Number(limit) : 100,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':applicationId/documents/:documentId')
  @HttpCode(501)
  async getDocument(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') _applicationId: string,
    @Param('documentId') _documentId: string,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return {
      error: {
        code: 'not_implemented',
        message: 'Document preview is not yet implemented.',
      },
    };
  }

  @Get(':applicationId')
  async get(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') applicationId: string,
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.providerApplicationService.getProviderApplication(
          applicationId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':applicationId/approve')
  approve(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    @Param('applicationId') applicationId: string,
    @Body() body: { reason?: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    return this.decide(authorization, request, applicationId, {
      decision: 'approved',
      reason: body.reason ?? 'Provider application approved.',
    });
  }

  @Post(':applicationId/reject')
  reject(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    @Param('applicationId') applicationId: string,
    @Body() body: { reason?: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    return this.decide(authorization, request, applicationId, {
      decision: 'rejected',
      reason: body.reason ?? '',
    });
  }

  private async decide(
    authorization: string | undefined,
    request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    applicationId: string,
    input: { decision: 'approved' | 'rejected'; reason: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!input.reason.trim()) {
        throw new InvalidAdminRequestError();
      }
      const application =
        await this.providerApplicationService.decideProviderApplication({
          applicationId,
          adminUserId: admin.user.id,
          decision: input.decision,
          reason: input.reason,
        });
      void this.recordAudit(admin, request, application, input);
      return { data: application };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(authorization: string | undefined): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }

    return currentUser;
  }

  private recordAudit(
    admin: CurrentUserProfile,
    request: { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
    application: AdminProviderApplicationSummary,
    input: { decision: 'approved' | 'rejected'; reason: string },
  ): Promise<unknown> {
    return this.adminAuditGatewayService.createAuditLog({
      adminUserId: admin.user.id,
      adminEmail: admin.user.email,
      adminName: admin.user.fullName,
      action: `${input.decision === 'approved' ? 'Approved' : 'Rejected'} provider application`,
      actionType: input.decision === 'approved' ? 'approve' : 'reject',
      entityType: 'ProviderApplication',
      entityId: application.id,
      details: `${application.applicationReference} for ${application.businessName ?? application.userId} was ${input.decision}.`,
      ipAddress: this.getClientIp(request),
      metadata: {
        providerId: application.id,
        userId: application.userId,
        decision: input.decision,
        reason: input.reason,
      },
    }).catch(() => undefined);
  }

  private getClientIp(request: {
    headers?: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
  }): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? null;
    }

    return forwardedFor?.split(',')[0]?.trim() || request.socket?.remoteAddress || null;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }

    if (error instanceof InvalidAdminRequestError) {
      return this.error('invalid_admin_request', 'Admin request is invalid.', 400);
    }

    if (error instanceof AdminDependencyUnavailableError) {
      return this.error(
        'admin_dependency_unavailable',
        'Admin service is unavailable.',
        503,
      );
    }

    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
