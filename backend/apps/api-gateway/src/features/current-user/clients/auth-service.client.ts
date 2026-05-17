import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CurrentUserIdentity,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
  UpdateCurrentUserProfileInput,
  UserRole,
  UserStatus,
} from '../current-user.types';
import {
  InvalidTwoFactorRequestError,
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from '../current-user.errors';
import {
  InvalidRegistrationRequestError,
  InvalidSharedAuthRequestError,
  InvalidPasswordResetRequestError,
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
  PasswordResetDependencyUnavailableError,
  RegistrationConflictError,
  RegistrationDependencyUnavailableError,
  SharedAuthDependencyUnavailableError,
} from '../../registration/registration.errors';
import {
  GoogleAuthorizationUrlRequest,
  GoogleAuthorizationUrlResponse,
  GoogleLogoutRequest,
  GoogleLogoutResponse,
  GoogleOAuthTokenResponse,
  GoogleTokenExchangeRequest,
  GoogleTokenRefreshRequest,
  OtpGenerateRequest,
  OtpGenerateResponse,
  OtpStatusResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
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

    if (response.status === 400) {
      throw new InvalidTwoFactorRequestError();
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

    if (response.status === 400) {
      throw new InvalidTwoFactorRequestError();
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

  async deleteCurrentUserAccount(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl()}/internal/users/${userId}/account`, {
      method: 'DELETE',
    });

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }
  }

  async enableTwoFactor(
    userId: string,
    label?: string | null,
  ): Promise<TwoFactorProvisioningResponse> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/two-factor/enable`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ label: label ?? null }),
      },
    );

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: TwoFactorProvisioningResponse;
    };
    return payload.data;
  }

  async verifyTwoFactor(
    userId: string,
    code: string,
  ): Promise<TwoFactorStatusResponse> {
    return this.writeTwoFactorStatus(
      `/internal/users/${userId}/two-factor/verify`,
      { code },
    );
  }

  async disableTwoFactor(
    userId: string,
    code?: string | null,
  ): Promise<TwoFactorStatusResponse> {
    return this.writeTwoFactorStatus(
      `/internal/users/${userId}/two-factor/disable`,
      { code: code ?? null },
    );
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

  generateOtp(input: OtpGenerateRequest): Promise<OtpGenerateResponse> {
    return this.sharedAuthRequest<OtpGenerateResponse>(
      '/internal/auth/shared/otp/generate',
      'POST',
      input,
    );
  }

  verifyOtp(input: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    return this.sharedAuthRequest<OtpVerifyResponse>(
      '/internal/auth/shared/otp/verify',
      'POST',
      input,
    );
  }

  getOtpStatus(otpId: string): Promise<OtpStatusResponse> {
    return this.sharedAuthRequest<OtpStatusResponse>(
      `/internal/auth/shared/otp/${encodeURIComponent(otpId)}/status`,
      'GET',
    );
  }

  getGoogleAuthorizationUrl(
    input: GoogleAuthorizationUrlRequest,
  ): Promise<GoogleAuthorizationUrlResponse> {
    return this.sharedAuthRequest<GoogleAuthorizationUrlResponse>(
      '/internal/auth/shared/google/authorize',
      'POST',
      input,
    );
  }

  exchangeGoogleCode(
    input: GoogleTokenExchangeRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    return this.sharedAuthRequest<GoogleOAuthTokenResponse>(
      '/internal/auth/shared/google/token',
      'POST',
      input,
    );
  }

  refreshGoogleToken(
    input: GoogleTokenRefreshRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    return this.sharedAuthRequest<GoogleOAuthTokenResponse>(
      '/internal/auth/shared/google/token/refresh',
      'POST',
      input,
    );
  }

  logoutGoogle(input: GoogleLogoutRequest): Promise<GoogleLogoutResponse> {
    return this.sharedAuthRequest<GoogleLogoutResponse>(
      '/internal/auth/shared/google/logout',
      'POST',
      input,
    );
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

  private async sharedAuthRequest<T>(
    path: string,
    method: 'GET' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl()}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const code = await this.readErrorCode(response);
      if (code === 'invalid_shared_auth_request') {
        throw new InvalidSharedAuthRequestError();
      }
      throw new SharedAuthDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async writeTwoFactorStatus(
    path: string,
    body: Record<string, unknown>,
  ): Promise<TwoFactorStatusResponse> {
    const response = await fetch(`${this.baseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: TwoFactorStatusResponse;
    };
    return payload.data;
  }
}
