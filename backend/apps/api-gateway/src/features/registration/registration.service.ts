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
  ProviderApplicationDocumentsResponse,
  ProviderApplicationStatusResponse,
  RegisterAccountRequest,
  RegisteredAccountResponse,
} from './registration.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
        const customerAddresses = input.address?.trim()
          ? [
              await this.userServiceClient.createCustomerAddress(user.id, {
                label: 'Home',
                address: input.address.trim(),
                isDefault: true,
              }),
            ]
          : [];
        return {
          user,
          customerProfile,
          customerAddresses,
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
        customerAddresses: [],
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

  async getProviderApplicationDocuments(
    userId: string,
  ): Promise<ProviderApplicationDocumentsResponse> {
    try {
      const application =
        await this.catalogServiceClient.getProviderApplicationByUserId(userId);

      if (!application) {
        throw new ProviderApplicationNotFoundError();
      }

      const { documents, ...status } = application;
      return {
        application: status,
        documents: documents ?? [],
      };
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

    if (
      input.role === 'provider' &&
      (!input.businessName?.trim() || !isAdultBirthdate(input.birthdate))
    ) {
      throw new InvalidRegistrationRequestError();
    }

    if (
      input.role === 'provider' &&
      input.serviceId?.trim() &&
      !UUID_PATTERN.test(input.serviceId.trim())
    ) {
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

function isAdultBirthdate(value?: string | null): boolean {
  const birthdate = parseDateParts(value?.trim() ?? '');
  const today = parseDateParts(formatLocalDate(new Date()));
  if (!birthdate || !today || compareDateParts(birthdate, today) > 0) {
    return false;
  }

  const age =
    today.year -
    birthdate.year -
    (today.month < birthdate.month ||
    (today.month === birthdate.month && today.day < birthdate.day)
      ? 1
      : 0);

  return age >= 18;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function compareDateParts(
  left: { year: number; month: number; day: number },
  right: { year: number; month: number; day: number },
): number {
  if (left.year !== right.year) {
    return left.year - right.year;
  }
  if (left.month !== right.month) {
    return left.month - right.month;
  }
  return left.day - right.day;
}
