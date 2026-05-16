import { Body, Controller, HttpException, Post } from '@nestjs/common';
import {
  InvalidPasswordResetRequestError,
  PasswordResetDependencyUnavailableError,
} from './password-reset.errors';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetRequest, PasswordResetResponse } from './password-reset.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('internal/auth/password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post()
  async request(
    @Body() body: PasswordResetRequest,
  ): Promise<{ data: PasswordResetResponse }> {
    try {
      this.validate(body);
      return {
        data: await this.passwordResetService.requestReset({
          email: body.email.trim().toLowerCase(),
          redirectTo: body.redirectTo?.trim() || null,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validate(body: PasswordResetRequest): void {
    const email = body.email?.trim() ?? '';
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new InvalidPasswordResetRequestError();
    }

    if (body.redirectTo && !isValidUrl(body.redirectTo)) {
      throw new InvalidPasswordResetRequestError();
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidPasswordResetRequestError) {
      return this.error(
        'invalid_password_reset_request',
        'Password reset request is invalid.',
        400,
      );
    }

    if (error instanceof PasswordResetDependencyUnavailableError) {
      return this.error(
        'password_reset_dependency_unavailable',
        'Password reset service is unavailable.',
        503,
      );
    }

    return this.error('password_reset_dependency_unavailable', 'Password reset failed.', 503);
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

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
