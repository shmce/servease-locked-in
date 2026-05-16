import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileDependencyUnavailableError } from '../current-user.errors';
import {
  ProviderOwnerSummary,
  ProviderProfileSummary,
} from '../current-user.types';
import { RegistrationDependencyUnavailableError } from '../../registration/registration.errors';
import { RegisterAccountRequest } from '../../registration/registration.types';

@Injectable()
export class CatalogServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findProviderProfileByUserId(
    userId: string,
  ): Promise<ProviderProfileSummary | null> {
    const response = await fetch(
      `${this.baseUrl()}/internal/providers/by-user/${userId}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: ProviderProfileSummary | null;
    };
    return payload.data;
  }

  async createProviderProfile(
    userId: string,
    input: RegisterAccountRequest,
  ): Promise<ProviderProfileSummary> {
    const response = await fetch(`${this.baseUrl()}/internal/providers`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        businessName: input.businessName ?? input.fullName,
        serviceDescription: input.serviceDescription ?? null,
        serviceArea: input.serviceArea ?? null,
      }),
    });

    if (!response.ok) {
      throw new RegistrationDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: ProviderProfileSummary;
    };
    return payload.data;
  }

  async findProviderOwnerByProviderId(
    providerId: string,
  ): Promise<ProviderOwnerSummary> {
    const response = await fetch(
      `${this.baseUrl()}/internal/providers/applications/${encodeURIComponent(
        providerId,
      )}`,
    );

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: ProviderOwnerSummary;
    };
    return {
      userId: payload.data.userId,
      businessName: payload.data.businessName,
    };
  }

  async updateProviderProfile(
    userId: string,
    input: {
      businessName: string;
      bio?: string | null;
      serviceDescription?: string | null;
      serviceArea?: string | null;
      yearsExperience?: number | null;
    },
  ): Promise<ProviderProfileSummary> {
    const response = await fetch(`${this.baseUrl()}/internal/providers/by-user/${userId}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as {
      data: ProviderProfileSummary;
    };
    return payload.data;
  }

  private baseUrl(): string {
    return this.configService.get<string>(
      'CATALOG_SERVICE_URL',
      'http://localhost:8503',
    );
  }
}
