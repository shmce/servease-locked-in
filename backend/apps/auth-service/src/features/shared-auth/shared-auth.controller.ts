import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import {
  InvalidSharedAuthRequestError,
  SharedAuthDependencyUnavailableError,
} from './shared-auth.errors';
import { SharedAuthService } from './shared-auth.service';
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

@Controller('internal/auth/shared')
export class SharedAuthController {
  constructor(private readonly sharedAuthService: SharedAuthService) {}

  @Post('otp/generate')
  async generateOtp(
    @Body() body: OtpGenerateRequest,
  ): Promise<{ data: OtpGenerateResponse }> {
    try {
      return { data: await this.sharedAuthService.generateOtp(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('otp/verify')
  async verifyOtp(
    @Body() body: OtpVerifyRequest,
  ): Promise<{ data: OtpVerifyResponse }> {
    try {
      return { data: await this.sharedAuthService.verifyOtp(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('otp/:otpId/status')
  async otpStatus(
    @Param('otpId') otpId: string,
  ): Promise<{ data: OtpStatusResponse }> {
    try {
      return { data: await this.sharedAuthService.getOtpStatus(otpId) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('google/authorize')
  async googleAuthorize(
    @Body() body: GoogleAuthorizationUrlRequest,
  ): Promise<{ data: GoogleAuthorizationUrlResponse }> {
    try {
      return { data: await this.sharedAuthService.getGoogleAuthorizationUrl(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('google/token')
  async googleToken(
    @Body() body: GoogleTokenExchangeRequest,
  ): Promise<{ data: GoogleOAuthTokenResponse }> {
    try {
      return { data: await this.sharedAuthService.exchangeGoogleCode(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('google/token/refresh')
  async googleTokenRefresh(
    @Body() body: GoogleTokenRefreshRequest,
  ): Promise<{ data: GoogleOAuthTokenResponse }> {
    try {
      return { data: await this.sharedAuthService.refreshGoogleToken(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('google/logout')
  async googleLogout(
    @Body() body: GoogleLogoutRequest,
  ): Promise<{ data: GoogleLogoutResponse }> {
    try {
      return { data: await this.sharedAuthService.logoutGoogle(body) };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof InvalidSharedAuthRequestError) {
      return this.error(
        'invalid_shared_auth_request',
        'Shared auth request is invalid.',
        400,
      );
    }

    if (error instanceof SharedAuthDependencyUnavailableError) {
      return this.error(
        'shared_auth_dependency_unavailable',
        'Shared auth service is unavailable.',
        503,
      );
    }

    return this.error(
      'shared_auth_dependency_unavailable',
      'Shared auth request failed.',
      503,
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException({ error: { code, message, details: {} } }, status);
  }
}

