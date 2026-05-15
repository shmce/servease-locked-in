import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileDependencyUnavailableError } from '../current-user.errors';
import { CustomerProfileSummary } from '../current-user.types';
import { RegistrationDependencyUnavailableError } from '../../registration/registration.errors';

@Injectable()
export class UserServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findCustomerProfileByUserId(
    userId: string,
  ): Promise<CustomerProfileSummary | null> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/customer-profile`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerProfileSummary | null;
    };
    return payload.data;
  }

  async createCustomerProfile(
    userId: string,
    address?: string | null,
  ): Promise<CustomerProfileSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/customer-profile`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ address: address ?? null }),
      },
    );

    if (!response.ok) {
      throw new RegistrationDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerProfileSummary;
    };
    return payload.data;
  }

  async updateCustomerProfile(
    userId: string,
    address?: string | null,
  ): Promise<CustomerProfileSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/customer-profile`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ address: address ?? null }),
      },
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerProfileSummary;
    };
    return payload.data;
  }

  private baseUrl(): string {
    return this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:8502',
    );
  }
}
