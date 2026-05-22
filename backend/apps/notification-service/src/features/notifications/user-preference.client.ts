import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UserPreferenceSummary {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  notificationPreferences: Record<string, unknown>;
}

@Injectable()
export class UserPreferenceClient {
  constructor(private readonly configService: ConfigService) {}

  async getByUserId(userId: string): Promise<UserPreferenceSummary> {
    const baseUrl = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:8502',
    );
    const response = await fetch(
      `${baseUrl}/internal/users/${encodeURIComponent(userId)}/preferences`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Preference lookup failed with ${response.status}`);
    }

    const payload = (await response.json()) as { data: UserPreferenceSummary };
    return payload.data;
  }
}
