import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminIntegrationService } from './admin-integration.service';
import {
  AdminIntegrationNotFoundError,
  InvalidAdminIntegrationRequestError,
} from './admin-integration.errors';
import { AdminIntegrationSummary } from './admin-integration.types';

interface UpdateCredentialsBody {
  adminUserId?: string;
  isEnabled?: boolean | null;
  webhookUrl?: string | null;
  apiKeyPreview?: string | null;
}

interface TestIntegrationBody {
  adminUserId?: string;
  success?: boolean;
  errorMessage?: string | null;
}

@Controller('internal/admin/integrations')
export class AdminIntegrationController {
  constructor(
    private readonly adminIntegrationService: AdminIntegrationService,
  ) {}

  @Get()
  async list(): Promise<{ data: AdminIntegrationSummary[] }> {
    try {
      return { data: await this.adminIntegrationService.listIntegrations() };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch(':provider/credentials')
  async updateCredentials(
    @Param('provider') provider: string,
    @Body() body: UpdateCredentialsBody,
  ): Promise<{ data: AdminIntegrationSummary }> {
    try {
      return {
        data: await this.adminIntegrationService.updateCredentials({
          provider,
          adminUserId: body.adminUserId ?? '',
          isEnabled: body.isEnabled ?? undefined,
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
    @Param('provider') provider: string,
    @Body() body: TestIntegrationBody,
  ): Promise<{ data: AdminIntegrationSummary }> {
    try {
      return {
        data: await this.adminIntegrationService.test({
          provider,
          adminUserId: body.adminUserId ?? '',
          success: body.success ?? true,
          errorMessage: body.errorMessage ?? null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidAdminIntegrationRequestError) {
      return this.error('invalid_admin_integration_request', error.message, 400);
    }

    if (error instanceof AdminIntegrationNotFoundError) {
      return this.error('admin_integration_not_found', error.message, 404);
    }

    return this.error(
      'admin_dependency_unavailable',
      'Admin integrations workflow failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      { error: { code, message, details: {} } },
      status,
    );
  }
}
