import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import {
  InvalidPasswordResetRequestError,
  InvalidRegistrationRequestError,
  InvalidSharedAuthRequestError,
  ProviderApplicationDependencyUnavailableError,
  ProviderApplicationNotFoundError,
} from './registration.errors';
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
  ProviderApplicationStatusResponse,
  RegisterAccountRequest,
  RegisteredAccountResponse,
} from './registration.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class RegistrationGatewayService {
  constructor(
    private readonly authServiceClient: AuthServiceClient,
    private readonly userServiceClient: UserServiceClient,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  async register(input: RegisterAccountRequest): Promise<RegisteredAccountResponse> {
    this.validate(input);

    const user = await this.authServiceClient.registerUser(input);
    try {
      if (input.role === 'customer') {
        const customerProfile = await this.userServiceClient.createCustomerProfile(
          user.id,
          input.address,
        );
        return {
          user,
          customerProfile,
          providerProfile: null,
        };
      }

      const providerProfile = await this.catalogServiceClient.createProviderProfile(
        user.id,
        input,
      );
      return {
        user,
        customerProfile: null,
        providerProfile,
      };
    } catch (error) {
      await this.authServiceClient.deleteRegisteredUser(user.id).catch(() => undefined);
      throw error;
    }
  }

  requestPasswordReset(
    input: PasswordResetRequest,
  ): Promise<PasswordResetResponse> {
    this.validatePasswordReset(input);
    return this.authServiceClient.requestPasswordReset({
      email: input.email.trim().toLowerCase(),
      redirectTo: input.redirectTo?.trim() || null,
    });
  }

  async generateOtp(input: OtpGenerateRequest): Promise<OtpGenerateResponse> {
    if (
      !input.target?.trim() ||
      !['sms', 'email'].includes(input.channel) ||
      (input.length !== undefined &&
        (!Number.isInteger(input.length) || input.length < 4 || input.length > 10)) ||
      (input.expiresInSeconds !== undefined &&
        (!Number.isInteger(input.expiresInSeconds) ||
          input.expiresInSeconds < 30 ||
          input.expiresInSeconds > 3600))
    ) {
      throw new InvalidSharedAuthRequestError();
    }

    return this.authServiceClient.generateOtp({
      target: input.target.trim(),
      channel: input.channel,
      length: input.length,
      expiresInSeconds: input.expiresInSeconds,
    });
  }

  async verifyOtp(input: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    if (!input.otpId?.trim() || !input.code?.trim()) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.verifyOtp({
      otpId: input.otpId.trim(),
      code: input.code.trim(),
    });
  }

  async getOtpStatus(otpId: string): Promise<OtpStatusResponse> {
    if (!otpId?.trim()) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.getOtpStatus(otpId.trim());
  }

  async getGoogleAuthorizationUrl(
    input: GoogleAuthorizationUrlRequest,
  ): Promise<GoogleAuthorizationUrlResponse> {
    if (!isValidUrl(input.redirectUri)) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.getGoogleAuthorizationUrl(input);
  }

  async exchangeGoogleCode(
    input: GoogleTokenExchangeRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    if (!input.code?.trim() || !isValidUrl(input.redirectUri)) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.exchangeGoogleCode(input);
  }

  async refreshGoogleToken(
    input: GoogleTokenRefreshRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    if (!input.refreshToken?.trim()) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.refreshGoogleToken(input);
  }

  async logoutGoogle(input: GoogleLogoutRequest): Promise<GoogleLogoutResponse> {
    if (!input.token?.trim() && !input.refreshToken?.trim() && !input.idTokenHint?.trim()) {
      throw new InvalidSharedAuthRequestError();
    }
    return this.authServiceClient.logoutGoogle(input);
  }

  async getProviderApplicationStatus(
    userId: string,
  ): Promise<ProviderApplicationStatusResponse> {
    try {
      const application =
        await this.catalogServiceClient.getProviderApplicationByUserId(userId);

      if (!application) {
        throw new ProviderApplicationNotFoundError();
      }

      return application;
    } catch (error) {
      if (error instanceof ProviderApplicationNotFoundError) {
        throw error;
      }

      throw new ProviderApplicationDependencyUnavailableError();
    }
  }

  private validate(input: RegisterAccountRequest): void {
    const email = input.email?.trim() ?? '';
    if (
      !email ||
      !EMAIL_PATTERN.test(email) ||
      !input.password ||
      input.password.length < 8 ||
      !input.fullName?.trim() ||
      !['customer', 'provider'].includes(input.role)
    ) {
      throw new InvalidRegistrationRequestError();
    }

    if (input.role === 'provider' && !input.businessName?.trim()) {
      throw new InvalidRegistrationRequestError();
    }
  }

  private validatePasswordReset(input: PasswordResetRequest): void {
    const email = input.email?.trim() ?? '';
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new InvalidPasswordResetRequestError();
    }

    if (input.redirectTo && !isValidUrl(input.redirectTo)) {
      throw new InvalidPasswordResetRequestError();
    }
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
