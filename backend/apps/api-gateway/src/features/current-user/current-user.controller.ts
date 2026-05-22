import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import {
  AccountDeletionDependencyUnavailableError,
  AccountInactiveError,
  AuthRequiredError,
  InvalidAuthTokenError,
  InvalidTwoFactorRequestError,
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from './current-user.errors';
import {
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
} from '../registration/registration.errors';
import { AuthTokenService } from './auth-token.service';
import { CurrentUserService } from './current-user.service';
import {
  CreateCustomerAddressRequest,
  CurrentUserProfile,
  CurrentUserSessionSummary,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
  TwoFactorVerificationInput,
  UpdateCustomerAddressRequest,
  UpdateCurrentUserPasswordInput,
  UpdateCurrentUserPasswordResponse,
  UpdateCurrentUserProfileInput,
} from './current-user.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('v1/me')
export class CurrentUserController {
  constructor(
    private readonly currentUserService: CurrentUserService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  async show(@Headers('authorization') authorization?: string): Promise<{
    data: CurrentUserProfile;
  }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.getCurrentUser(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch()
  async update(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateCurrentUserProfileInput,
  ): Promise<{ data: CurrentUserProfile }> {
    try {
      if (!body.fullName?.trim()) {
        throw this.error(
          'invalid_profile_update_request',
          'Profile update request is invalid.',
          400,
        );
      }
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.updateCurrentUser(userId, {
        fullName: body.fullName.trim(),
        contactNumber: body.contactNumber?.trim() || null,
        address: body.address?.trim() || null,
        businessName: body.businessName?.trim() || null,
        bio: body.bio?.trim() || null,
        serviceDescription: body.serviceDescription?.trim() || null,
        serviceArea: body.serviceArea?.trim() || null,
        yearsExperience:
          body.yearsExperience === undefined || body.yearsExperience === null
            ? null
            : Number(body.yearsExperience),
      });
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('password')
  async updatePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateCurrentUserPasswordInput,
  ): Promise<{ data: UpdateCurrentUserPasswordResponse }> {
    try {
      if (
        !body.currentPassword ||
        !body.newPassword ||
        body.newPassword.length < 8 ||
        body.currentPassword === body.newPassword
      ) {
        throw this.error(
          'invalid_password_change_request',
          'Password change request is invalid.',
          400,
        );
      }
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.updateCurrentUserPassword(
        userId,
        body,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete()
  async deleteAccount(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<{ data: { ok: true } }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.deleteCurrentUser(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('addresses')
  async listAddresses(
    @Headers('authorization') authorization?: string,
  ) {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.listCustomerAddresses(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('addresses')
  async createAddress(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateCustomerAddressRequest,
  ) {
    try {
      this.assertAddressBody(body);
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.createCustomerAddress(userId, {
        ...body,
        label: body.label?.trim() || 'Home',
        address: body.address.trim(),
      });
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Patch('addresses/:addressId')
  async updateAddress(
    @Headers('authorization') authorization: string | undefined,
    @Param('addressId') addressId: string,
    @Body() body: UpdateCustomerAddressRequest,
  ) {
    try {
      this.assertAddressId(addressId);
      if (body.address !== undefined && !body.address?.trim()) {
        throw this.error(
          'invalid_customer_address_request',
          'Customer address request is invalid.',
          400,
        );
      }
      this.assertCoordinates(body);
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.updateCustomerAddress(
        userId,
        addressId,
        {
          ...body,
          label: body.label?.trim() || undefined,
          address: body.address?.trim() || undefined,
        },
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('addresses/:addressId/default')
  async setDefaultAddress(
    @Headers('authorization') authorization: string | undefined,
    @Param('addressId') addressId: string,
  ) {
    try {
      this.assertAddressId(addressId);
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.setDefaultCustomerAddress(
        userId,
        addressId,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Delete('addresses/:addressId')
  async deleteAddress(
    @Headers('authorization') authorization: string | undefined,
    @Param('addressId') addressId: string,
  ) {
    try {
      this.assertAddressId(addressId);
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.deleteCustomerAddress(
        userId,
        addressId,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('sessions')
  async listSessions(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: CurrentUserSessionSummary[] }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.listCurrentUserSessions(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/enable')
  async enableTwoFactor(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: TwoFactorProvisioningResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.enableTwoFactor(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Get('two-factor')
  async getTwoFactorStatus(
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.getTwoFactorStatus(userId);
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/verify')
  async verifyTwoFactor(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: TwoFactorVerificationInput,
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.verifyTwoFactor(
        userId,
        body.code ?? '',
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  @Post('two-factor/disable')
  async disableTwoFactor(
    @Headers('authorization') authorization?: string,
    @Body() body?: TwoFactorVerificationInput,
  ): Promise<{ data: TwoFactorStatusResponse }> {
    try {
      const userId = await this.authTokenService.authenticate(authorization);
      const data = await this.currentUserService.disableTwoFactor(
        userId,
        body?.code ?? null,
      );
      return { data };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof AuthRequiredError) {
      return this.error('auth_required', 'Authentication is required.', 401);
    }

    if (error instanceof InvalidAuthTokenError) {
      return this.error('invalid_auth_token', 'Authentication token is invalid.', 401);
    }

    if (error instanceof AccountInactiveError) {
      return this.error('account_inactive', 'This account is not active.', 403);
    }

    if (error instanceof AccountDeletionDependencyUnavailableError) {
      return this.error(
        'account_deletion_dependency_unavailable',
        'Account deletion cannot complete while booking services are unavailable.',
        503,
      );
    }

    if (error instanceof InvalidPasswordChangeRequestError) {
      return this.error(
        'invalid_password_change_request',
        'Password change request is invalid.',
        400,
      );
    }

    if (error instanceof PasswordChangeDependencyUnavailableError) {
      return this.error(
        'password_change_dependency_unavailable',
        'Password change service is unavailable.',
        503,
      );
    }

    if (error instanceof UserNotFoundError) {
      return this.error('user_not_found', 'User was not found.', 404);
    }

    if (error instanceof InvalidTwoFactorRequestError) {
      return this.error(
        'invalid_two_factor_request',
        'Two-factor authentication request is invalid.',
        400,
      );
    }

    if (error instanceof ProfileDependencyUnavailableError) {
      return this.error(
        'profile_dependency_unavailable',
        'Profile service is unavailable.',
        503,
      );
    }

    return this.error(
      'profile_dependency_unavailable',
      'Profile lookup failed.',
      503,
    );
  }

  private error(code: string, message: string, status: HttpStatus): HttpException {
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

  private assertAddressBody(body: CreateCustomerAddressRequest): void {
    if (!body.address?.trim()) {
      throw this.error(
        'invalid_customer_address_request',
        'Customer address request is invalid.',
        400,
      );
    }
    this.assertCoordinates(body);
  }

  private assertAddressId(addressId: string): void {
    if (!UUID_PATTERN.test(addressId)) {
      throw this.error(
        'invalid_customer_address_request',
        'Customer address request is invalid.',
        400,
      );
    }
  }

  private assertCoordinates(body: {
    latitude?: number | null;
    longitude?: number | null;
  }): void {
    const hasLatitude = body.latitude !== undefined && body.latitude !== null;
    const hasLongitude = body.longitude !== undefined && body.longitude !== null;
    if (hasLatitude !== hasLongitude) {
      throw this.error(
        'invalid_customer_address_request',
        'Customer address request is invalid.',
        400,
      );
    }
    if (
      (hasLatitude &&
        (typeof body.latitude !== 'number' ||
          !Number.isFinite(body.latitude) ||
          Math.abs(body.latitude) > 90)) ||
      (hasLongitude &&
        (typeof body.longitude !== 'number' ||
          !Number.isFinite(body.longitude) ||
          Math.abs(body.longitude) > 180))
    ) {
      throw this.error(
        'invalid_customer_address_request',
        'Customer address request is invalid.',
        400,
      );
    }
  }
}
