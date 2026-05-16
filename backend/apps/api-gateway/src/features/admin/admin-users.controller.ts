import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
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
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminUsersGatewayService } from './admin-users.service';
import { AdminUserSummary, AdminUsersSummaryStats } from './admin-users.types';

const validUserStatuses = new Set(['active', 'suspended', 'inactive']);
const validUserRoles = new Set(['customer', 'provider', 'admin']);

type AuditRequest = { headers?: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } };

@Controller('v1/admin/users')
export class AdminUsersController {
  constructor(
    private readonly adminUsersGatewayService: AdminUsersGatewayService,
    private readonly adminAuditGatewayService: AdminAuditGatewayService,
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  @Post()
  @HttpCode(501)
  async create(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ error: { code: string; message: string } }> {
    await this.requireAdmin(authorization).catch(() => {
      throw this.error('admin_required', 'An admin account is required.', 403);
    });
    return {
      error: {
        code: 'not_implemented',
        message: 'Admin user creation is not yet implemented.',
      },
    };
  }

  @Get('summary')
  async getSummary(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: AdminUsersSummaryStats }> {
    try {
      await this.requireAdmin(authorization);
      return { data: await this.adminUsersGatewayService.getSummary() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminUserSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      if (role && !validUserRoles.has(role)) throw new InvalidAdminRequestError();
      if (status && !validUserStatuses.has(status)) throw new InvalidAdminRequestError();
      return { data: await this.adminUsersGatewayService.listUsers(role ?? null, status ?? null, query ?? null) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':userId/status')
  async updateStatus(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('userId') userId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: AdminUserSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (!body.status || !validUserStatuses.has(body.status)) throw new InvalidAdminRequestError();
      const user = await this.adminUsersGatewayService.updateUserStatus(userId, body.status);
      void this.adminAuditGatewayService.createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: `Updated user status to ${body.status}`,
        actionType: 'update',
        entityType: 'User',
        entityId: user.id,
        details: `User ${user.email} status updated to ${body.status}.`,
        ipAddress: this.getClientIp(request),
        metadata: { userId: user.id, email: user.email, status: body.status },
      }).catch(() => undefined);
      return { data: user };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(authorization: string | undefined): Promise<CurrentUserProfile> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') throw new AdminRequiredError();
    return currentUser;
  }

  private getClientIp(request: AuditRequest): string | null {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? null;
    return forwardedFor?.split(',')[0]?.trim() || request.socket?.remoteAddress || null;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError)
      return this.error('auth_required', 'Authentication is required.', 401);
    if (error instanceof InvalidAuthTokenError)
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    if (error instanceof AdminRequiredError)
      return this.error('admin_required', 'An admin account is required.', 403);
    if (error instanceof InvalidAdminRequestError)
      return this.error('invalid_admin_request', 'Admin request is invalid.', 400);
    if (error instanceof AdminDependencyUnavailableError)
      return this.error('admin_dependency_unavailable', 'Admin service is unavailable.', 503);
    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
