import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileDependencyUnavailableError } from '../current-user.errors';
import {
  CreateCustomerAddressRequest,
  CustomerAddressSummary,
  CustomerProfileSummary,
  UpdateCustomerAddressRequest,
} from '../current-user.types';
import { RegistrationDependencyUnavailableError } from '../../registration/registration.errors';
import { ReferralDependencyUnavailableError } from '../../referrals/referral.errors';
import { ReferralSummary } from '../../referrals/referral.types';
import { UserPreferencesDependencyUnavailableError } from '../../preferences/preference.errors';
import {
  UpdateUserPreferencesRequest,
  UserPreferenceSummary,
} from '../../preferences/preference.types';

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

  async listCustomerAddresses(userId: string): Promise<CustomerAddressSummary[]> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/addresses`,
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerAddressSummary[];
    };
    return payload.data;
  }

  async createCustomerAddress(
    userId: string,
    body: CreateCustomerAddressRequest,
  ): Promise<CustomerAddressSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/addresses`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerAddressSummary;
    };
    return payload.data;
  }

  async updateCustomerAddress(
    userId: string,
    addressId: string,
    body: UpdateCustomerAddressRequest,
  ): Promise<CustomerAddressSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/addresses/${addressId}`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerAddressSummary;
    };
    return payload.data;
  }

  async setDefaultCustomerAddress(
    userId: string,
    addressId: string,
  ): Promise<CustomerAddressSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/addresses/${addressId}/default`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: CustomerAddressSummary;
    };
    return payload.data;
  }

  async deleteCustomerAddress(
    userId: string,
    addressId: string,
  ): Promise<{ ok: true }> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/addresses/${addressId}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: { ok: true };
    };
    return payload.data;
  }

  async getReferralSummary(userId: string): Promise<ReferralSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/referral-summary`,
    );

    if (!response.ok) {
      throw new ReferralDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: ReferralSummary;
    };
    return payload.data;
  }

  async getUserPreferences(userId: string): Promise<UserPreferenceSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/preferences`,
    );

    if (!response.ok) {
      throw new UserPreferencesDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: UserPreferenceSummary;
    };
    return payload.data;
  }

  async updateUserPreferences(
    userId: string,
    input: UpdateUserPreferencesRequest,
  ): Promise<UserPreferenceSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/users/${userId}/preferences`,
      {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );

    if (!response.ok) {
      throw new UserPreferencesDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: UserPreferenceSummary;
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
