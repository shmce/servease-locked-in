import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { BookingServiceClient } from '../booking/clients/booking-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';
import {
  AccountDeletionDependencyUnavailableError,
  AccountInactiveError,
  ProfileDependencyUnavailableError,
} from './current-user.errors';
import {
  CreateCustomerAddressRequest,
  CurrentUserProfile,
  CustomerAddressSummary,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
  UpdateCustomerAddressRequest,
  UpdateCurrentUserPasswordInput,
  UpdateCurrentUserPasswordResponse,
  UpdateCurrentUserProfileInput,
} from './current-user.types';

@Injectable()
export class CurrentUserService {
  constructor(
    private readonly authServiceClient: AuthServiceClient,
    private readonly userServiceClient: UserServiceClient,
    private readonly catalogServiceClient: CatalogServiceClient,
    private readonly bookingServiceClient?: BookingServiceClient,
  ) {}

  async getCurrentUser(userId: string): Promise<CurrentUserProfile> {
    const user = await this.authServiceClient.findUserById(userId);

    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    const [customerProfile, customerAddresses] = await Promise.all([
      this.userServiceClient.findCustomerProfileByUserId(user.id),
      this.listCustomerAddressesForProfile(user.id, user.role),
    ]);
    const providerProfile =
      user.role === 'provider' || user.role === 'admin'
        ? await this.catalogServiceClient.findProviderProfileByUserId(user.id)
        : null;

    return {
      user,
      customerProfile,
      customerAddresses,
      providerProfile,
    };
  }

  async updateCurrentUser(
    userId: string,
    input: UpdateCurrentUserProfileInput,
  ): Promise<CurrentUserProfile> {
    const user = await this.authServiceClient.updateUser(userId, input);

    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    const [customerProfile, customerAddresses] = await Promise.all([
      user.role === 'customer' || user.role === 'admin'
        ? this.userServiceClient.updateCustomerProfile(user.id, input.address)
        : this.userServiceClient.findCustomerProfileByUserId(user.id),
      this.listCustomerAddressesForProfile(user.id, user.role),
    ]);
    const providerProfile =
      user.role === 'provider' || user.role === 'admin'
        ? await this.catalogServiceClient.updateProviderProfile(
            user.id,
            {
              businessName: input.businessName ?? user.fullName ?? user.email,
              bio: input.bio ?? null,
              serviceDescription: input.serviceDescription ?? null,
              serviceArea: input.serviceArea ?? null,
              yearsExperience: input.yearsExperience ?? null,
            },
          )
        : null;

    return {
      user,
      customerProfile,
      customerAddresses,
      providerProfile,
    };
  }

  async listCustomerAddresses(userId: string): Promise<CustomerAddressSummary[]> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.userServiceClient.listCustomerAddresses(user.id);
  }

  async createCustomerAddress(
    userId: string,
    input: CreateCustomerAddressRequest,
  ): Promise<CustomerAddressSummary> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.userServiceClient.createCustomerAddress(user.id, input);
  }

  async updateCustomerAddress(
    userId: string,
    addressId: string,
    input: UpdateCustomerAddressRequest,
  ): Promise<CustomerAddressSummary> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.userServiceClient.updateCustomerAddress(user.id, addressId, input);
  }

  async setDefaultCustomerAddress(
    userId: string,
    addressId: string,
  ): Promise<CustomerAddressSummary> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.userServiceClient.setDefaultCustomerAddress(user.id, addressId);
  }

  async deleteCustomerAddress(
    userId: string,
    addressId: string,
  ): Promise<{ ok: true }> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.userServiceClient.deleteCustomerAddress(user.id, addressId);
  }

  async updateCurrentUserPassword(
    userId: string,
    input: UpdateCurrentUserPasswordInput,
  ): Promise<UpdateCurrentUserPasswordResponse> {
    const user = await this.authServiceClient.findUserById(userId);

    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.authServiceClient.updatePassword(user.id, user.email, input);
  }

  async listCurrentUserSessions(userId: string) {
    const sessions = await this.authServiceClient.listUserSessions(userId);
    return sessions.map((session) => ({
      id: session.id,
      email: session.email,
      createdAt: session.createdAt,
      lastSignInAt: session.lastSignInAt,
      isCurrent: session.id === userId,
    }));
  }

  async enableTwoFactor(userId: string): Promise<TwoFactorProvisioningResponse> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.authServiceClient.enableTwoFactor(user.id, user.email);
  }

  async getTwoFactorStatus(userId: string): Promise<TwoFactorStatusResponse> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.authServiceClient.getTwoFactorStatus(user.id);
  }

  async verifyTwoFactor(
    userId: string,
    code: string,
  ): Promise<TwoFactorStatusResponse> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.authServiceClient.verifyTwoFactor(user.id, code);
  }

  async disableTwoFactor(
    userId: string,
    code?: string | null,
  ): Promise<TwoFactorStatusResponse> {
    const user = await this.authServiceClient.findUserById(userId);
    if (user.status !== 'active') {
      throw new AccountInactiveError();
    }

    return this.authServiceClient.disableTwoFactor(user.id, code ?? null);
  }

  async deleteCurrentUser(userId: string): Promise<{ ok: true }> {
    const user = await this.authServiceClient.findUserById(userId);
    const bookingServiceClient = this.bookingServiceClient;

    if (!bookingServiceClient) {
      throw new AccountDeletionDependencyUnavailableError();
    }

    const providerProfile =
      user.role === 'provider' || user.role === 'admin'
        ? await this.catalogServiceClient.findProviderProfileByUserId(user.id)
        : null;

    const [customerBookings, providerBookings] = await Promise.all([
      bookingServiceClient.listBookings(user.id, null),
      providerProfile
        ? bookingServiceClient.listBookings(null, providerProfile.id)
        : Promise.resolve([]),
    ]);

    const activeBookings = [...customerBookings, ...providerBookings].filter(
      (booking, index, all) =>
        ['pending', 'confirmed', 'in_progress'].includes(booking.status) &&
        all.findIndex((item) => item.id === booking.id) === index,
    );

    await Promise.all(
      activeBookings.map((booking) =>
        bookingServiceClient.transitionStatus(
          booking.id,
          user.id,
          booking.status,
          'cancelled',
          'Account deleted',
          'Account owner requested deletion.',
        ),
      ),
    );

    await this.authServiceClient.deleteCurrentUserAccount(user.id);
    return { ok: true };
  }

  private async listCustomerAddressesForProfile(
    userId: string,
    role: string,
  ): Promise<CustomerAddressSummary[]> {
    if (role !== 'customer' && role !== 'admin') {
      return [];
    }

    try {
      return await this.userServiceClient.listCustomerAddresses(userId);
    } catch (error) {
      if (error instanceof ProfileDependencyUnavailableError) {
        return [];
      }
      throw error;
    }
  }
}
