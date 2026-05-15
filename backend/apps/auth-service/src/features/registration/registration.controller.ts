import { Body, Controller, Delete, HttpException, Param, Post } from '@nestjs/common';
import {
  InvalidRegistrationRequestError,
  RegistrationConflictError,
} from './registration.errors';
import { RegistrationService } from './registration.service';
import { RegisterUserInput, RegisteredUserResponse } from './registration.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/auth/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async create(
    @Body() body: RegisterUserInput,
  ): Promise<{ data: RegisteredUserResponse }> {
    try {
      this.validateCreate(body);
      return {
        data: await this.registrationService.register({
          email: body.email.trim().toLowerCase(),
          password: body.password,
          fullName: body.fullName.trim(),
          contactNumber: body.contactNumber?.trim() || null,
          role: body.role,
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete(':userId')
  async delete(@Param('userId') userId: string): Promise<{ data: { ok: true } }> {
    try {
      if (!UUID_PATTERN.test(userId)) {
        throw new InvalidRegistrationRequestError();
      }
      await this.registrationService.deleteUser(userId);
      return { data: { ok: true } };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validateCreate(body: RegisterUserInput): void {
    const email = body.email?.trim() ?? '';
    if (
      !email ||
      !EMAIL_PATTERN.test(email) ||
      !body.password ||
      body.password.length < 8 ||
      !body.fullName?.trim() ||
      !['customer', 'provider'].includes(body.role)
    ) {
      throw new InvalidRegistrationRequestError();
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

    return this.error(
      'registration_dependency_unavailable',
      'Registration failed.',
      503,
    );
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
