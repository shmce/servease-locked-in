import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
  AdminServiceRequestError,
  AdminRequiredError,
  InvalidAdminRequestError,
} from './admin-support.errors';
import { AdminUsersGatewayService } from './admin-users.service';
import {
  AdminAccessRoleId,
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
  UpdateAdminUserAccessRequest,
  adminAccessRoleIds,
} from './admin-users.types';

const validUserStatuses = new Set(['active', 'suspended', 'inactive']);
const validUserRoles = new Set(['customer', 'provider', 'admin']);
const validAdminAccessRoles = new Set<AdminAccessRoleId>(adminAccessRoleIds);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Body() body: CreateAdminUserRequest,
  ): Promise<{ data: AdminUserSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const input = this.normalizeCreateInput(body);
      const user = await this.adminUsersGatewayService.createUser(input);
      void this.adminAuditGatewayService.createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Created admin user',
        actionType: 'create',
        entityType: 'User',
        entityId: user.id,
        details: `Admin user ${user.email} was created.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          userId: user.id,
          email: user.email,
          accessRole: input.accessRole,
          sendInvitation: input.sendInvitation,
          requireTwoFactor: input.requireTwoFactor,
        },
      }).catch(() => undefined);
      return { data: user };
    } catch (error) {
      throw this.toHttpException(error);
    }
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

  @Patch(':userId/access')
  async updateAccess(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('userId') userId: string,
    @Body() body: UpdateAdminUserAccessRequest,
  ): Promise<{ data: AdminUserSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      const input = this.normalizeAccessInput(body);
      const user = await this.adminUsersGatewayService.updateUserAccess(userId, input);
      void this.adminAuditGatewayService.createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Updated admin role permissions',
        actionType: 'update',
        entityType: 'User',
        entityId: user.id,
        details: `Admin user ${user.email} access role updated to ${input.accessRole}.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          userId: user.id,
          email: user.email,
          accessRole: input.accessRole,
          requireTwoFactor: input.requireTwoFactor,
        },
      }).catch(() => undefined);
      return { data: user };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':userId')
  async delete(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: AuditRequest,
    @Param('userId') userId: string,
  ): Promise<{ data: AdminUserSummary }> {
    try {
      const admin = await this.requireAdmin(authorization);
      if (admin.user.id === userId) {
        throw new InvalidAdminRequestError();
      }

      const user = await this.adminUsersGatewayService.deleteUser(userId);
      void this.adminAuditGatewayService.createAuditLog({
        adminUserId: admin.user.id,
        adminEmail: admin.user.email,
        adminName: admin.user.fullName,
        action: 'Deleted admin user',
        actionType: 'delete',
        entityType: 'User',
        entityId: user.id,
        details: `Admin user ${user.email} was deleted.`,
        ipAddress: this.getClientIp(request),
        metadata: {
          userId: user.id,
          email: user.email,
          accessRole: user.accessRole ?? null,
        },
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

  private normalizeCreateInput(body?: Partial<CreateAdminUserRequest>): CreateAdminUserRequest {
    const email = body?.email?.trim().toLowerCase() ?? '';
    const fullName = body?.fullName?.trim() ?? '';
    if (
      !email ||
      !EMAIL_PATTERN.test(email) ||
      !body?.password ||
      body.password.length < 8 ||
      !fullName
    ) {
      throw new InvalidAdminRequestError();
    }

    return {
      email,
      password: body.password,
      fullName,
      contactNumber: body.contactNumber?.trim() || null,
      accessRole: this.normalizeOptionalAccessRole(body.accessRole),
      sendInvitation: Boolean(body.sendInvitation),
      requireTwoFactor: Boolean(body.requireTwoFactor),
    };
  }

  private normalizeAccessInput(
    body?: Partial<UpdateAdminUserAccessRequest>,
  ): UpdateAdminUserAccessRequest {
    const accessRole = body?.accessRole?.trim() ?? '';
    if (!this.isAdminAccessRoleId(accessRole)) {
      throw new InvalidAdminRequestError();
    }

    return {
      accessRole,
      requireTwoFactor:
        body?.requireTwoFactor === undefined
          ? undefined
          : Boolean(body.requireTwoFactor),
    };
  }

  private normalizeOptionalAccessRole(
    accessRole?: string | null,
  ): AdminAccessRoleId | null {
    const normalized = accessRole?.trim() ?? '';
    if (!normalized) return null;
    if (!this.isAdminAccessRoleId(normalized)) {
      throw new InvalidAdminRequestError();
    }
    return normalized;
  }

  private isAdminAccessRoleId(role: string): role is AdminAccessRoleId {
    return validAdminAccessRoles.has(role as AdminAccessRoleId);
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
    if (error instanceof AdminServiceRequestError)
      return this.error(error.code, error.message, error.status);
    if (error instanceof AdminDependencyUnavailableError)
      return this.error('admin_dependency_unavailable', 'Admin service is unavailable.', 503);
    return this.error('admin_dependency_unavailable', 'Admin request failed.', 503);
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
