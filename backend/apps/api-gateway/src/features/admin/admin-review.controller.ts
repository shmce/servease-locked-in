import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AccountInactiveError,
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  ReviewDependencyUnavailableError,
  ReviewNotFoundError,
} from '../reviews/review.errors';
import { ReviewServiceClient } from '../reviews/clients/review-service.client';
import { ReviewSummary } from '../reviews/review.types';
import { AdminAuditGatewayService } from './admin-audit.service';
import { AdminRequiredError } from './admin-support.errors';

@Controller('v1/admin/reviews')
export class AdminReviewController {
  private readonly logger = new Logger(AdminReviewController.name);

  constructor(
    private readonly reviewServiceClient: ReviewServiceClient,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    @Optional()
    private readonly adminAuditGatewayService?: AdminAuditGatewayService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('providerId') providerId?: string,
    @Query('flagged') flagged?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ReviewSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      const parsedLimit = limit ? Math.min(Math.max(Number(limit), 1), 500) : undefined;
      return {
        data: await this.reviewServiceClient.listForAdmin({
          providerId: providerId ?? null,
          flaggedOnly: flagged === 'true',
          limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':reviewId/flag')
  async setFlagged(
    @Headers('authorization') authorization: string | undefined,
    @Param('reviewId') reviewId: string,
    @Body() body: { isFlagged?: boolean; reason?: string | null },
  ): Promise<{ data: ReviewSummary }> {
    try {
      const adminId = await this.requireAdmin(authorization);
      const review = await this.reviewServiceClient.setReviewFlagged(reviewId, {
        isFlagged: body.isFlagged ?? false,
        reason: body.reason ?? null,
        adminId,
      });
      if (this.adminAuditGatewayService) {
        const profile = await this.currentUserService
          .getCurrentUser(adminId)
          .catch((error: unknown) => {
            this.logger.warn(
              `Could not load admin profile ${adminId} before creating review audit log: ${this.errorMessage(error)}`,
            );
            return null;
          });
        void this.adminAuditGatewayService
          .createAuditLog({
            adminUserId: adminId,
            adminEmail: profile?.user.email ?? null,
            adminName: profile?.user.fullName ?? null,
            action: review.isFlagged ? 'Hid review' : 'Restored review',
            actionType: 'update',
            entityType: 'Review',
            entityId: review.id,
            details:
              body.reason?.trim() ||
              (review.isFlagged
                ? 'Admin hid review from public listings.'
                : 'Admin restored review.'),
            ipAddress: null,
            metadata: {
              reviewId: review.id,
              providerId: review.providerId,
              isFlagged: review.isFlagged,
            },
          })
          .catch((error: unknown) => {
            this.logger.warn(
              `Could not create audit log for review ${review.id} flag update: ${this.errorMessage(error)}`,
            );
          });
      }
      return { data: review };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(authorization: string | undefined): Promise<string> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser: CurrentUserProfile =
      await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
    return userId;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }
    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }
    if (error instanceof AccountInactiveError) {
      return this.error('account_inactive', 'This account is not active.', 403);
    }
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    if (error instanceof ReviewNotFoundError) {
      return this.error('review_not_found', 'Review was not found.', 404);
    }
    if (error instanceof ReviewDependencyUnavailableError) {
      return this.error(
        'review_dependency_unavailable',
        'Review service is unavailable.',
        503,
      );
    }
    return this.error('review_dependency_unavailable', 'Review lookup failed.', 503);
  }

  private error(code: string, message: string, status: HttpStatus): HttpException {
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
