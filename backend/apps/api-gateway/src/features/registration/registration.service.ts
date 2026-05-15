import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import { InvalidRegistrationRequestError } from './registration.errors';
import {
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
}
