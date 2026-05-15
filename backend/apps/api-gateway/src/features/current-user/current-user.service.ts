import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from './clients/auth-service.client';
import { CatalogServiceClient } from './clients/catalog-service.client';
import { UserServiceClient } from './clients/user-service.client';
import { AccountInactiveError } from './current-user.errors';
import { CurrentUserProfile } from './current-user.types';

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
}
