import { Body, Controller, HttpException, Post } from '@nestjs/common';
import {
  InvalidRegistrationRequestError,
  RegistrationConflictError,
  RegistrationDependencyUnavailableError,
} from './registration.errors';
import { RegistrationGatewayService } from './registration.service';
import {
  RegisterAccountRequest,
  RegisteredAccountResponse,
} from './registration.types';

@Controller('v1/auth')
export class RegistrationController {
  constructor(private readonly registrationGatewayService: RegistrationGatewayService) {}

  @Post('register')
  async register(
    @Body() body: RegisterAccountRequest,
  ): Promise<{ data: RegisteredAccountResponse }> {
    try {
      return {
        data: await this.registrationGatewayService.register(body),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidRegistrationRequestError) {
      return this.error(
        'invalid_registration_request',
        'Registration request is invalid.',
        400,
      );
    }

    if (error instanceof RegistrationConflictError) {
      return this.error(
        'registration_conflict',
        'An account with this email already exists.',
        409,
      );
    }

    if (error instanceof RegistrationDependencyUnavailableError) {
      return this.error(
        'registration_dependency_unavailable',
        'Registration service is unavailable.',
        503,
      );
    }

    return this.error('registration_dependency_unavailable', 'Registration failed.', 503);
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
