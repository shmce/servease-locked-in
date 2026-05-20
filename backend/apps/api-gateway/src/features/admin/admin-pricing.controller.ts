import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Post,
  Put,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import { CurrentUserService } from '../current-user/current-user.service';
import { CurrentUserProfile } from '../current-user/current-user.types';
import {
  AdminDependencyUnavailableError,
  AdminRequiredError,
  AdminServiceRequestError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminPricingGatewayService } from './admin-pricing.service';
import {
  CreatePricingFuelIndexRequest,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  SyncPricingFuelIndexRequest,
  UpsertPricingCategoryRuleRequest,
} from './admin-payment.types';

@Controller('v1/admin/pricing')
export class AdminPricingController {
  constructor(
    private readonly adminPricingGatewayService: AdminPricingGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Get('rules')
  async listRules(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PricingCategoryRuleSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return { data: await this.adminPricingGatewayService.listRules() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Put('rules')
  async upsertRule(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpsertPricingCategoryRuleRequest,
  ): Promise<{ data: PricingCategoryRuleSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      this.validateRule(body);
      return {
        data: await this.adminPricingGatewayService.upsertRule({
          ...body,
          adminUserId: admin.user.id,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('fuel-index')
  async listFuelIndex(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PricingFuelIndexSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return { data: await this.adminPricingGatewayService.listFuelIndex() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('fuel-index')
  async createFuelIndex(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreatePricingFuelIndexRequest,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (
        !body.region?.trim() ||
        !Number.isFinite(body.fuelPricePerLiter) ||
        body.fuelPricePerLiter <= 0
      ) {
        throw new InvalidAdminRequestError();
      }
      return {
        data: await this.adminPricingGatewayService.createFuelIndex({
          ...body,
          region: body.region.trim(),
          adminUserId: admin.user.id,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('fuel-index/sync')
  async syncFuelIndexFromGasWatch(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: Omit<SyncPricingFuelIndexRequest, 'adminUserId'>,
  ): Promise<{ data: PricingFuelIndexSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      return {
        data: await this.adminPricingGatewayService.syncFuelIndexFromGasWatch({
          ...(body ?? {}),
          adminUserId: admin.user.id,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('quote-audits')
  async listQuoteAudits(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: PricingQuoteAuditSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return { data: await this.adminPricingGatewayService.listQuoteAudits() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validateRule(body: UpsertPricingCategoryRuleRequest): void {
    if (
      !body.categoryName?.trim() ||
      !Number.isFinite(body.baselineMin) ||
      !Number.isFinite(body.baselineMax) ||
      body.baselineMin < 0 ||
      body.baselineMax < body.baselineMin
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
      return this.error('admin_required', 'Admin access is required.', 403);
    }
    if (error instanceof InvalidAdminRequestError) {
      return this.error(
        'invalid_pricing_rule_request',
        'Pricing rule is invalid.',
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
      'Admin pricing failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
