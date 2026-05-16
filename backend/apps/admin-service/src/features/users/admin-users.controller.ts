import { Body, Controller, Get, HttpException, Param, Patch, Query } from '@nestjs/common';
import { AdminUsersGatewayService } from './admin-users.service';
import { AdminUserSummary, AdminUsersSummaryStats } from './admin-users.types';

@Controller('internal/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersGatewayService) {}

  @Get('summary')
  async summary(): Promise<{ data: AdminUsersSummaryStats }> {
    try {
      return { data: await this.adminUsersService.getSummary() };
    } catch {
      throw this.unavailable();
    }
  }

  @Get()
  async list(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ): Promise<{ data: AdminUserSummary[] }> {
    try {
      return { data: await this.adminUsersService.listUsers(role ?? null, status ?? null, query ?? null) };
    } catch {
      throw this.unavailable();
    }
  }

  @Patch(':userId/status')
  async updateStatus(
    @Param('userId') userId: string,
    @Body() body: { status?: string },
  ): Promise<{ data: AdminUserSummary }> {
    try {
      return { data: await this.adminUsersService.updateUserStatus(userId, body.status ?? '') };
    } catch {
      throw this.unavailable();
    }
  }

  private unavailable(): HttpException {
    return new HttpException(
      { error: { code: 'user_dependency_unavailable', message: 'User service is unavailable.', details: {} } },
      503,
    );
  }
}
