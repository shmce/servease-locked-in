import { Body, Controller, HttpException, Post } from '@nestjs/common';
import {
  InvalidRegistrationRequestError,
  RegistrationConflictError,
} from '../registration/registration.errors';
import { RegistrationService } from '../registration/registration.service';
import { RegisteredUserResponse } from '../registration/registration.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateAdminUserBody {
  email?: string;
  password?: string;
  fullName?: string;
  contactNumber?: string | null;
}

@Controller('internal/auth/admin-users')
export class AdminUserController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async create(
    @Body() body: CreateAdminUserBody,
  ): Promise<{ data: RegisteredUserResponse }> {
    try {
      this.validate(body);
      return {
        data: await this.registrationService.register({
          email: body.email!.trim().toLowerCase(),
          password: body.password!,
          fullName: body.fullName!.trim(),
          contactNumber: body.contactNumber?.trim() || null,
          role: 'admin',
        }),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private validate(body?: CreateAdminUserBody): void {
    const email = body?.email?.trim() ?? '';
    if (
      !email ||
      !EMAIL_PATTERN.test(email) ||
      !body?.password ||
      body.password.length < 8 ||
      !body.fullName?.trim()
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
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}
