import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  UploadedFile as NestUploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthTokenService } from '../current-user/auth-token.service';
import {
  AuthRequiredError,
  InvalidAuthTokenError,
} from '../current-user/current-user.errors';
import {
  InvalidUploadRequestError,
  UploadDependencyUnavailableError,
} from './upload.errors';
import { UploadGatewayService } from './upload.service';
import { UploadedFile, UploadSummary } from './upload.types';

@Controller('v1/uploads')
export class UploadController {
  constructor(
    private readonly uploadGatewayService: UploadGatewayService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body('kind') kind: string | undefined,
    @Body('documentType') documentType: string | undefined,
    @NestUploadedFile() file: UploadedFile | undefined,
  ): Promise<{ data: UploadSummary }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      return {
        data: await this.uploadGatewayService.uploadFile(userId, kind, file, {
          documentType,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof InvalidUploadRequestError) {
      return this.error('invalid_upload_request', 'Upload request is invalid.', 400);
    }

    if (error instanceof UploadDependencyUnavailableError) {
      return this.error(
        'upload_dependency_unavailable',
        'Upload storage is unavailable.',
        503,
      );
    }

    return this.error('upload_dependency_unavailable', 'Upload failed.', 503);
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
