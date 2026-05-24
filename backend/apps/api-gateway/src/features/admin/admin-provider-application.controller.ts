import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminProviderApplicationGatewayService } from './admin-provider-application.service';
import {
  AdminProviderApplicationDocumentSummary,
  AdminProviderApplicationInfoRequestResult,
  AdminProviderApplicationReview,
  AdminProviderApplicationSummary,
  ProviderApplicationStatus,
  UpdateProviderApplicationReviewInput,
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
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';

const validStatuses = new Set(['pending', 'approved', 'rejected']);

@Controller('v1/admin/provider-applications')
export class AdminProviderApplicationController {
  private readonly logger = new Logger(AdminProviderApplicationController.name);

  constructor(
    private readonly providerApplicationService: AdminProviderApplicationGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly notificationServiceClient: NotificationServiceClient,
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
  async getDocument(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ): Promise<{ data: AdminProviderApplicationDocumentSummary }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.providerApplicationService.getProviderApplicationDocument(
          applicationId,
          documentId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get(':applicationId/documents/:documentId/download')
  async getDocumentDownload(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ): Promise<{ data: AdminProviderApplicationDocumentSummary }> {
    return this.getDocument(authorization, applicationId, documentId);
  }

  @Get(':applicationId/review')
  async getReview(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') applicationId: string,
  ): Promise<{ data: AdminProviderApplicationReview }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.providerApplicationService.getProviderApplicationReview(
          applicationId,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put(':applicationId/review')
  async updateReview(
    @Headers('authorization') authorization: string | undefined,
    @Param('applicationId') applicationId: string,
    @Body() body: UpdateProviderApplicationReviewInput,
  ): Promise<{ data: AdminProviderApplicationReview }> {
    try {
      const admin = await this.requireAdmin(authorization);
      return {
        data: await this.providerApplicationService.updateProviderApplicationReview({
          ...body,
          applicationId,
          adminUserId: admin.user.id,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':applicationId/review/notes')
  async addReviewNote(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('applicationId') applicationId: string,
    @Body() body: { note?: string },
  ): Promise<{ data: AdminProviderApplicationReview }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const note = body.note?.trim() ?? '';
      if (!note) {
        throw new InvalidAdminRequestError();
      }
      const application =
        await this.providerApplicationService.getProviderApplication(
          applicationId,
        );
      const data =
        await this.providerApplicationService.addProviderApplicationReviewNote({
          applicationId,
          adminUserId: admin.user.id,
          note,
        });
      void this.recordReviewNoteAudit(admin, request, application, note);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
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
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
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
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('applicationId') applicationId: string,
    @Body() body: { reason?: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    return this.decide(authorization, request, applicationId, {
      decision: 'rejected',
      reason: body.reason ?? '',
    });
  }

  @Post(':applicationId/request-info')
  async requestInfo(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('applicationId') applicationId: string,
    @Body() body: { message?: string },
  ): Promise<{ data: AdminProviderApplicationInfoRequestResult }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const message = body.message?.trim() ?? '';
      if (!message) {
        throw new InvalidAdminRequestError();
      }

      const application =
        await this.providerApplicationService.getProviderApplication(
          applicationId,
        );
      const notification =
        await this.notificationServiceClient.createNotification({
          userId: application.userId,
          type: 'provider_application_info_requested',
          title: 'More information needed for your provider application',
          body: message,
          metadata: {
            applicationId: application.id,
            applicationReference: application.applicationReference,
            adminUserId: admin.user.id,
          },
        });
      void this.recordInfoRequestAudit(admin, request, application, message);

      return {
        data: {
          applicationId: application.id,
          providerUserId: application.userId,
          notificationId: notification.id,
        },
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async decide(
    authorization: string | undefined,
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    applicationId: string,
    input: { decision: 'approved' | 'rejected'; reason: string },
  ): Promise<{ data: AdminProviderApplicationSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!input.reason.trim()) {
        throw new InvalidAdminRequestError();
      }
      if (input.decision === 'approved') {
        const review =
          await this.providerApplicationService.getProviderApplicationReview(
            applicationId,
          );
        if (!review.isComplete) {
          throw new InvalidAdminRequestError();
        }
      }
      const application =
        await this.providerApplicationService.decideProviderApplication({
          applicationId,
          adminUserId: admin.user.id,
          decision: input.decision,
          reason: input.reason,
        });
      void this.notificationServiceClient
        .createNotification({
          userId: application.userId,
          type:
            input.decision === 'approved'
              ? 'provider_application_approved'
              : 'provider_application_rejected',
          title:
            input.decision === 'approved'
              ? 'Provider application approved'
              : 'Provider application rejected',
          body: input.reason,
          metadata: {
            applicationId: application.id,
            applicationReference: application.applicationReference,
            adminUserId: admin.user.id,
            decision: input.decision,
          },
        })
        .catch((error: unknown) => {
          this.logger.warn(
            `Could not create provider application ${input.decision} notification for ${application.id}: ${this.errorMessage(error)}`,
          );
        });
      void this.recordAudit(admin, request, application, input);
      return { data: application };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);

    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }

    return currentUser;
  }

  private recordAudit(
    admin: CurrentUserProfile,
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    application: AdminProviderApplicationSummary,
    input: { decision: 'approved' | 'rejected'; reason: string },
  ): Promise<unknown> {
    return this.auditProviderApplicationAction(
      {
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
      },
      `${input.decision} provider application ${application.id}`,
    );
  }

  private recordInfoRequestAudit(
    admin: CurrentUserProfile,
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    application: AdminProviderApplicationSummary,
    message: string,
  ): Promise<unknown> {
    return this.auditProviderApplicationAction(
      {
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Requested provider application information',
        actionType: 'update',
        entityType: 'ProviderApplication',
        entityId: application.id,
        details: `Requested more information for ${application.applicationReference}.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          providerId: application.id,
          userId: application.userId,
          message,
        },
      },
      `request more information for provider application ${application.id}`,
    );
  }

  private recordReviewNoteAudit(
    admin: CurrentUserProfile,
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    application: AdminProviderApplicationSummary,
    note: string,
  ): Promise<unknown> {
    return this.auditProviderApplicationAction(
      {
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Added provider application review note',
        actionType: 'update',
        entityType: 'ProviderApplication',
        entityId: application.id,
        details: `Added a review note for ${application.applicationReference}.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          providerId: application.id,
          userId: application.userId,
          note,
        },
      },
      `add review note for provider application ${application.id}`,
    );
  }

  private async auditProviderApplicationAction(
    input: Parameters<AdminAuditGatewayService['createAuditLog']>[0],
    context: string,
  ): Promise<void> {
    try {
      await this.adminAuditGatewayService.createAuditLog(input);
    } catch (error) {
      this.logger.warn(
        `Could not create audit log for provider application action (${context}): ${this.errorMessage(error)}`,
      );
    }
  }

  private getClientIp(request: {
    headers?: Record<string, string | string[] | undefined>;
    socket?: { remoteAddress?: string };
  }): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? null;
    }

    return (
      forwardedFor?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      null
    );
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error(
        'invalid_auth_token',
        'Authentication token is invalid.',
        401,
      );
    }

    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }

    if (error instanceof InvalidAdminRequestError) {
      return this.error(
        'invalid_admin_request',
        'Admin request is invalid.',
        400,
      );
    }

    if (error instanceof AdminServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }

    if (error instanceof AdminDependencyUnavailableError) {
      return this.error(
        'admin_dependency_unavailable',
        'Admin service is unavailable.',
        503,
      );
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin request failed.',
      503,
    );
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

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
