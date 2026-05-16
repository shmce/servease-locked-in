import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { UserPreferenceRepository } from './preference.service';
import {
  UpdateUserPreferencesInput,
  UserPreferenceSummary,
} from './preference.types';

interface SupabasePreferenceClient {
  rpc(
    functionName: string,
    args: Record<string, boolean | Record<string, unknown> | string | null>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabasePreferenceRow | null;
      error: { message: string } | null;
    }>;
  };
}

interface SupabasePreferenceRow {
  user_id: string;
  push_notifications_enabled: boolean;
  dark_mode_enabled: boolean;
  language: string;
  notification_preferences: Record<string, unknown> | null;
  updated_at: string | null;
}

@Injectable()
export class SupabasePreferenceRepository implements UserPreferenceRepository {
  private readonly client: SupabasePreferenceClient;

  constructor(client?: SupabasePreferenceClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabasePreferenceClient);
  }

  async getByUserId(userId: string): Promise<UserPreferenceSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_user_preferences', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load user preferences: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to load user preferences: missing row');
    }

    return this.mapPreference(data);
  }

  async update(
    input: UpdateUserPreferencesInput,
  ): Promise<UserPreferenceSummary> {
    const { data, error } = await this.client
      .rpc('servease_upsert_user_preferences', {
        p_user_id: input.userId,
        p_push_notifications_enabled: input.pushNotificationsEnabled ?? null,
        p_dark_mode_enabled: input.darkModeEnabled ?? null,
        p_language: input.language ?? null,
        p_notification_preferences: input.notificationPreferences ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update user preferences: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update user preferences: missing row');
    }

    return this.mapPreference(data);
  }

  private mapPreference(row: SupabasePreferenceRow): UserPreferenceSummary {
    return {
      userId: row.user_id,
      pushNotificationsEnabled: row.push_notifications_enabled,
      darkModeEnabled: row.dark_mode_enabled,
      language: row.language,
      notificationPreferences: row.notification_preferences ?? {},
      updatedAt: row.updated_at,
    };
  }
}
