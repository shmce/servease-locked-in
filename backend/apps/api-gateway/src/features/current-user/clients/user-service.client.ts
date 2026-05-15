import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileDependencyUnavailableError } from '../current-user.errors';
import { CustomerProfileSummary } from '../current-user.types';

@Injectable()
export class UserServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findCustomerProfileByUserId(
    userId: string,
  ): Promise<CustomerProfileSummary | null> {
    const baseUrl = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:8502',
    );
    const response = await fetch(
      `${baseUrl}/internal/users/${userId}/customer-profile`,
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
}
