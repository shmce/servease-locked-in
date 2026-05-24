import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { AdminPaymentGatewayService } from './admin-payment.service';
import {
  PromotionSummary,
  UpsertPromotionRequest,
} from './admin-payment.types';

const validPromotionStatuses = new Set([
  'active',
  'scheduled',
  'expired',
  'disabled',
]);
const validDiscountTypes = new Set(['percent', 'fixed']);

@Controller('v1/admin/promotions')
export class AdminPromotionController {
  private readonly logger = new Logger(AdminPromotionController.name);

  constructor(
    private readonly adminPaymentGatewayService: AdminPaymentGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('status') status?: string,
  ): Promise<{ data: PromotionSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (status && !validPromotionStatuses.has(status)) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPaymentGatewayService.listPromotions(
          status ?? null,
        ),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Body() body: UpsertPromotionRequest,
  ): Promise<{ data: PromotionSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      this.validatePromotionBody(body);
      const promotion =
        await this.adminPaymentGatewayService.createPromotion(body);
      void this.recordAudit(admin, request, {
        action: 'Created promotion',
        actionType: 'create',
        entityId: promotion.id,
        details: `Created promotion ${promotion.code}.`,
        metadata: { promotionId: promotion.id, code: promotion.code },
      });
      return {
        data: promotion,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':promotionId')
  async update(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('promotionId') promotionId: string,
    @Body() body: UpsertPromotionRequest,
  ): Promise<{ data: PromotionSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!promotionId) {
        throw new InvalidAdminRequestError();
      }
      this.validatePromotionBody(body);
      const promotion = await this.adminPaymentGatewayService.updatePromotion(
        promotionId,
        body,
      );
      void this.recordAudit(admin, request, {
        action: 'Updated promotion',
        actionType: 'update',
        entityId: promotion.id,
        details: `Updated promotion ${promotion.code}.`,
        metadata: { promotionId: promotion.id, code: promotion.code },
      });
      return {
        data: promotion,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':promotionId')
  async delete(
    @Headers('authorization') authorization: string | undefined,
    @Req()
    request: {
      headers?: Record<string, string | string[] | undefined>;
      socket?: { remoteAddress?: string };
    },
    @Param('promotionId') promotionId: string,
  ): Promise<{ data: PromotionSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!promotionId) {
        throw new InvalidAdminRequestError();
      }
      const promotion =
        await this.adminPaymentGatewayService.deletePromotion(promotionId);
      void this.recordAudit(admin, request, {
        action: 'Deleted promotion',
        actionType: 'delete',
        entityId: promotion.id,
        details: `Deleted promotion ${promotion.code}.`,
        metadata: { promotionId: promotion.id, code: promotion.code },
      });
      return {
        data: promotion,
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validatePromotionBody(body: UpsertPromotionRequest): void {
    if (
      !body.code?.trim() ||
      !validDiscountTypes.has(body.discountType) ||
      !Number.isFinite(Number(body.discountValue)) ||
      Number(body.discountValue) <= 0 ||
      !Number.isFinite(Number(body.minOrderAmount ?? 0)) ||
      Number(body.minOrderAmount ?? 0) < 0
    ) {
      throw new InvalidAdminRequestError();
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
    input: {
      action: string;
      actionType: 'create' | 'delete' | 'update';
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
        entityType: 'Promotion',
        entityId: input.entityId,
        details: input.details,
        ipAddress: this.getClientIp(request),
        metadata: input.metadata,
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not create promotion audit log for ${input.entityId}: ${this.errorMessage(error)}`,
        );
      });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
}
