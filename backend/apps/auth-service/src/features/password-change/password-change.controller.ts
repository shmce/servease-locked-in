import { Body, Controller, HttpException, Post } from '@nestjs/common';
import {
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
} from './password-change.errors';
import { PasswordChangeService } from './password-change.service';
import { PasswordChangeRequest, PasswordChangeResponse } from './password-change.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/auth/password-change')
export class PasswordChangeController {
  constructor(private readonly passwordChangeService: PasswordChangeService) {}

  @Post()
  async change(
    @Body() body: PasswordChangeRequest,
  ): Promise<{ data: PasswordChangeResponse }> {
    try {
      this.validate(body);
      return {
        data: await this.passwordChangeService.changePassword({
          userId: body.userId,
          email: body.email.trim().toLowerCase(),
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validate(body: PasswordChangeRequest): void {
    const email = body.email?.trim() ?? '';
    if (
      !UUID_PATTERN.test(body.userId ?? '') ||
      !email ||
      !EMAIL_PATTERN.test(email) ||
      !body.currentPassword ||
      !body.newPassword ||
      body.newPassword.length < 8 ||
      body.currentPassword === body.newPassword
    ) {
      throw new InvalidPasswordChangeRequestError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidPasswordChangeRequestError) {
      return this.error(
        'invalid_password_change_request',
        'Password change request is invalid.',
        400,
      );
    }

    if (error instanceof PasswordChangeDependencyUnavailableError) {
      return this.error(
        'password_change_dependency_unavailable',
        'Password change service is unavailable.',
        503,
      );
    }

    return this.error('password_change_dependency_unavailable', 'Password change failed.', 503);
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
