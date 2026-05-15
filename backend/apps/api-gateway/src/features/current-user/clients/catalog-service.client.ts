import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileDependencyUnavailableError } from '../current-user.errors';
import { ProviderProfileSummary } from '../current-user.types';

@Injectable()
export class CatalogServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findProviderProfileByUserId(
    userId: string,
  ): Promise<ProviderProfileSummary | null> {
    const baseUrl = this.configService.get<string>(
      'CATALOG_SERVICE_URL',
      'http://localhost:8503',
    );
    const response = await fetch(
      `${baseUrl}/internal/providers/by-user/${userId}`,
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
}
