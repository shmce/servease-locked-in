import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminUsersGatewayService } from './admin-users.service';
import {
  AdminUserSummary,
  AdminUsersSummaryStats,
  CreateAdminUserRequest,
  UpdateAdminUserAccessRequest,
} from './admin-users.types';
import { AdminUserRequestError } from './admin-user.errors';

@Controller('internal/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersGatewayService) {}

  @Post()
  async create(
    @Body() body: CreateAdminUserRequest,
  ): Promise<{ data: AdminUserSummary }> {
    try {
      return { data: await this.adminUsersService.createUser(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('summary')
  async summary(): Promise<{ data: AdminUsersSummaryStats }> {
    try {
      return { data: await this.adminUsersService.getSummary() };
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
      return { data: await this.adminUsersService.listUsers(role ?? null, status ?? null, query ?? null) };
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
      return { data: await this.adminUsersService.updateUserStatus(userId, body.status ?? '') };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':userId/access')
  async updateAccess(
    @Param('userId') userId: string,
    @Body() body: UpdateAdminUserAccessRequest,
  ): Promise<{ data: AdminUserSummary }> {
    try {
      return { data: await this.adminUsersService.updateUserAccess(userId, body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string): Promise<{ data: AdminUserSummary }> {
    try {
      return { data: await this.adminUsersService.deleteUser(userId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AdminUserRequestError) {
      return new HttpException(
        { error: { code: error.code, message: error.message, details: {} } },
        error.status,
      );
    }

    return new HttpException(
      { error: { code: 'user_dependency_unavailable', message: 'User service is unavailable.', details: {} } },
      503,
    );
  }
}
