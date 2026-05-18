import { Injectable } from '@nestjs/common';
import { createApicenterClient } from '../../../../../libs/common/src';
import {
  InvalidSharedAuthRequestError,
  SharedAuthDependencyUnavailableError,
} from './shared-auth.errors';
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
} from './shared-auth.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class SharedAuthService {
  async generateOtp(input: OtpGenerateRequest): Promise<OtpGenerateResponse> {
    const target = input.target?.trim();
    if (
      !target ||
      !['sms', 'email'].includes(input.channel) ||
      (input.channel === 'email' && !EMAIL_PATTERN.test(target)) ||
      (input.length !== undefined &&
        (!Number.isInteger(input.length) || input.length < 4 || input.length > 10)) ||
      (input.expiresInSeconds !== undefined &&
        (!Number.isInteger(input.expiresInSeconds) ||
          input.expiresInSeconds < 30 ||
          input.expiresInSeconds > 3600))
    ) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().otpGenerate({
        target,
        channel: input.channel,
        length: input.length,
        expiresInSeconds: input.expiresInSeconds,
      });
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async verifyOtp(input: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    const otpId = input.otpId?.trim();
    const code = input.code?.trim();
    if (!otpId || !code) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().otpVerify({ otpId, code });
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async getOtpStatus(otpId: string): Promise<OtpStatusResponse> {
    const normalized = otpId.trim();
    if (!normalized) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().otpStatus(normalized);
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async getGoogleAuthorizationUrl(
    input: GoogleAuthorizationUrlRequest,
  ): Promise<GoogleAuthorizationUrlResponse> {
    if (!this.isValidUrl(input.redirectUri)) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().gauthGetAuthorizationUrl({
        ...input,
        redirectUri: input.redirectUri.trim(),
        state: input.state?.trim() || undefined,
        scopes: this.normalizeScopes(input.scopes),
      });
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async exchangeGoogleCode(
    input: GoogleTokenExchangeRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    if (!input.code?.trim() || !this.isValidUrl(input.redirectUri)) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().gauthExchangeCode({
        code: input.code.trim(),
        redirectUri: input.redirectUri.trim(),
        codeVerifier: input.codeVerifier?.trim() || undefined,
      });
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async refreshGoogleToken(
    input: GoogleTokenRefreshRequest,
  ): Promise<GoogleOAuthTokenResponse> {
    const refreshToken = input.refreshToken?.trim();
    if (!refreshToken) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().gauthRefreshToken({ refreshToken });
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  async logoutGoogle(input: GoogleLogoutRequest): Promise<GoogleLogoutResponse> {
    const payload = {
      token: input.token?.trim() || undefined,
      refreshToken: input.refreshToken?.trim() || undefined,
      idTokenHint: input.idTokenHint?.trim() || undefined,
    };
    if (!payload.token && !payload.refreshToken && !payload.idTokenHint) {
      throw new InvalidSharedAuthRequestError();
    }

    try {
      return await createApicenterClient().gauthLogout(payload);
    } catch (error) {
      if (error instanceof InvalidSharedAuthRequestError) {
        throw error;
      }
      throw new SharedAuthDependencyUnavailableError();
    }
  }

  private normalizeScopes(scopes: string[] | undefined): string[] | undefined {
    const normalized = scopes
      ?.map((scope) => scope.trim())
      .filter((scope) => scope.length > 0);
    return normalized?.length ? normalized : undefined;
  }

  private isValidUrl(value: string | undefined): boolean {
    try {
      if (!value?.trim()) {
        return false;
      }
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
