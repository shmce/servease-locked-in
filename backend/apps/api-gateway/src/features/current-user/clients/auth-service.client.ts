import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CurrentUserIdentity,
  UpdateCurrentUserProfileInput,
  UserRole,
  UserStatus,
} from '../current-user.types';
import {
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from '../current-user.errors';
import {
  InvalidRegistrationRequestError,
  InvalidPasswordResetRequestError,
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
  PasswordResetDependencyUnavailableError,
  RegistrationConflictError,
  RegistrationDependencyUnavailableError,
} from '../../registration/registration.errors';
import {
  PasswordResetRequest,
  PasswordResetResponse,
  RegisterAccountRequest,
} from '../../registration/registration.types';
import {
  UpdateCurrentUserPasswordInput,
  UpdateCurrentUserPasswordResponse,
} from '../current-user.types';

@Injectable()
export class AuthServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findUserById(userId: string): Promise<CurrentUserIdentity> {
    const baseUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:8501',
    );
    const response = await fetch(`${baseUrl}/internal/users/${userId}`);

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: CurrentUserIdentity };
    return {
      id: payload.data.id,
      email: payload.data.email,
      fullName: payload.data.fullName,
      contactNumber: payload.data.contactNumber,
      role: payload.data.role as UserRole,
      status: payload.data.status as UserStatus,
    };
  }

  async listUserSessions(userId: string): Promise<
    Array<{
      id: string;
      email: string;
      createdAt: string | null;
      lastSignInAt: string | null;
    }>
  > {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/sessions`,
    );

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: Array<{
        id: string;
        email: string;
        createdAt: string | null;
        lastSignInAt: string | null;
      }>;
    };
    return payload.data;
  }

  async registerUser(input: RegisterAccountRequest): Promise<CurrentUserIdentity> {
    const response = await fetch(`${this.baseUrl()}/internal/auth/registrations`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        contactNumber: input.contactNumber ?? null,
        role: input.role,
      }),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_registration_request') {
        throw new InvalidRegistrationRequestError();
      }
      if (code === 'registration_conflict') {
        throw new RegistrationConflictError();
      }
      throw new RegistrationDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: CurrentUserIdentity };
    return payload.data;
  }

  async deleteRegisteredUser(userId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl()}/internal/auth/registrations/${userId}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new RegistrationDependencyUnavailableError();
    }
  }

  async requestPasswordReset(
    input: PasswordResetRequest,
  ): Promise<PasswordResetResponse> {
    const response = await fetch(`${this.baseUrl()}/internal/auth/password-reset`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        redirectTo: input.redirectTo ?? null,
      }),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_password_reset_request') {
        throw new InvalidPasswordResetRequestError();
      }
      throw new PasswordResetDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: PasswordResetResponse };
    return payload.data;
  }

  async updatePassword(
    userId: string,
    email: string,
    input: UpdateCurrentUserPasswordInput,
  ): Promise<UpdateCurrentUserPasswordResponse> {
    const response = await fetch(`${this.baseUrl()}/internal/auth/password-change`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      }),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_password_change_request') {
        throw new InvalidPasswordChangeRequestError();
      }
      throw new PasswordChangeDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: UpdateCurrentUserPasswordResponse;
    };
    return payload.data;
  }

  async updateUser(
    userId: string,
    input: UpdateCurrentUserProfileInput,
  ): Promise<CurrentUserIdentity> {
    const response = await fetch(`${this.baseUrl()}/internal/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fullName: input.fullName,
        contactNumber: input.contactNumber ?? null,
      }),
    });

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: CurrentUserIdentity };
    return payload.data;
  }

  private baseUrl(): string {
    return this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:8501',
    );
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
