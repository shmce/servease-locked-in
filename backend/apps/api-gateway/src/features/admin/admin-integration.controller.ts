import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CurrentUserService } from '../current-user/current-user.service';
import {
  AdminRequiredError,
  AdminDependencyUnavailableError,
  AdminServiceRequestError,
} from './admin-support.errors';
import { AdminServiceClient } from './clients/admin-service.client';
import { AdminIntegrationSummary } from './admin-integration.types';

interface UpdateCredentialsBody {
  isEnabled?: boolean | null;
  webhookUrl?: string | null;
  apiKeyPreview?: string | null;
}

interface TestIntegrationBody {
  success?: boolean;
  errorMessage?: string | null;
}

@Controller('v1/admin/integrations')
export class AdminIntegrationController {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly currentUserService: CurrentUserService,
    private readonly adminServiceClient: AdminServiceClient,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: AdminIntegrationSummary[] }> {
    try {
      await this.requireAdmin(authorization);
      return {
        data: await this.adminServiceClient.listAdminIntegrations(),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':provider/credentials')
  async updateCredentials(
    @Headers('authorization') authorization: string | undefined,
    @Param('provider') provider: string,
    @Body() body: UpdateCredentialsBody,
  ): Promise<{ data: AdminIntegrationSummary }> {
    try {
      const adminUserId = await this.requireAdmin(authorization);
      return {
        data: await this.adminServiceClient.updateAdminIntegrationCredentials({
          provider,
          adminUserId,
          isEnabled: body.isEnabled ?? null,
          webhookUrl:
            body.webhookUrl === undefined ? undefined : body.webhookUrl,
          apiKeyPreview:
            body.apiKeyPreview === undefined ? undefined : body.apiKeyPreview,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post(':provider/test')
  async test(
    @Headers('authorization') authorization: string | undefined,
    @Param('provider') provider: string,
    @Body() body: TestIntegrationBody,
  ): Promise<{ data: AdminIntegrationSummary }> {
    try {
      const adminUserId = await this.requireAdmin(authorization);
      return {
        data: await this.adminServiceClient.testAdminIntegration({
          provider,
          adminUserId,
          success: body.success ?? true,
          errorMessage: body.errorMessage ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async requireAdmin(
    authorization: string | undefined,
  ): Promise<string> {
    const userId = await this.authTokenService.authenticate(authorization);
    const currentUser = await this.currentUserService.getCurrentUser(userId);
    if (currentUser.user.role !== 'admin') {
      throw new AdminRequiredError();
    }
    return userId;
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AdminRequiredError) {
      return this.error('admin_required', 'An admin account is required.', 403);
    }
    if (error instanceof AdminServiceRequestError) {
      return this.error(error.code, error.message, error.status);
    }

    if (error instanceof AdminDependencyUnavailableError) {
      return this.error(
        'admin_dependency_unavailable',
        'Admin integrations service is unavailable.',
        503,
      );
    }
    if (error instanceof HttpException) {
      return error;
    }
    return this.error(
      'admin_dependency_unavailable',

      'Admin integrations request failed.',

      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
