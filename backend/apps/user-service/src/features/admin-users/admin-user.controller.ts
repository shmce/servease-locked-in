import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserSummary, AdminUsersSummaryStats } from './admin-user.types';

@Controller('internal/admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get('summary')
  async summary(): Promise<{ data: AdminUsersSummaryStats }> {
    try {
      return { data: await this.adminUserService.getSummary() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get()
  async list(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminUserSummary[] }> {
    try {
      return { data: await this.adminUserService.listUsers(role ?? null, status ?? null, query ?? null) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':userId/status')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: AdminUserSummary }> {
    try {
      return { data: await this.adminUserService.updateUserStatus(userId, body.status ?? '') };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'invalid_user_request') {
      return new HttpException({ error: { code: 'invalid_user_request', message: 'User request is invalid.', details: {} } }, 400);
    }
    return new HttpException({ error: { code: 'admin_users_unavailable', message: 'User service failed.', details: {} } }, 503);
  }
}
