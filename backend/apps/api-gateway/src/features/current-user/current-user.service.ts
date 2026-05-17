import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { BookingServiceClient } from '../booking/clients/booking-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { AccountInactiveError } from './current-user.errors';
import {
  CurrentUserProfile,
  TwoFactorProvisioningResponse,
  TwoFactorStatusResponse,
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

    const customerProfile =
      await this.userServiceClient.findCustomerProfileByUserId(user.id);
    const providerProfile =
      user.role === 'provider' || user.role === 'admin'
        ? await this.catalogServiceClient.findProviderProfileByUserId(user.id)
        : null;

    return {
      user,
      customerProfile,
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

    const customerProfile =
      user.role === 'customer' || user.role === 'admin'
        ? await this.userServiceClient.updateCustomerProfile(user.id, input.address)
        : await this.userServiceClient.findCustomerProfileByUserId(user.id);
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
      providerProfile,
    };
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
    const providerProfile =
      user.role === 'provider' || user.role === 'admin'
        ? await this.catalogServiceClient.findProviderProfileByUserId(user.id)
        : null;

    const [customerBookings, providerBookings] = await Promise.all([
      this.bookingServiceClient?.listBookings(user.id, null).catch(() => []) ??
        Promise.resolve([]),
      providerProfile && this.bookingServiceClient
        ? this.bookingServiceClient.listBookings(null, providerProfile.id).catch(() => [])
        : Promise.resolve([]),
    ]);

    const activeBookings = [...customerBookings, ...providerBookings].filter(
      (booking, index, all) =>
        ['pending', 'confirmed', 'in_progress'].includes(booking.status) &&
        all.findIndex((item) => item.id === booking.id) === index,
    );

    await Promise.all(
      activeBookings.map((booking) =>
        this.bookingServiceClient
          ? this.bookingServiceClient
          .transitionStatus(
            booking.id,
            user.id,
            booking.status,
            'cancelled',
            'Account deleted',
            'Account owner requested deletion.',
          )
          .catch(() => null)
          : Promise.resolve(null),
      ),
    );

    await this.authServiceClient.deleteCurrentUserAccount(user.id);
    return { ok: true };
  }
}
