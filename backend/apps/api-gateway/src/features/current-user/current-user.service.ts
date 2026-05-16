import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { AccountInactiveError } from './current-user.errors';
import {
  CurrentUserProfile,
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
}
