import { Inject, Injectable } from '@nestjs/common';
import {
  UpdateUserPreferencesInput,
  UserPreferenceSummary,
} from './preference.types';

export const USER_PREFERENCE_REPOSITORY = Symbol('USER_PREFERENCE_REPOSITORY');

export interface UserPreferenceRepository {
  getByUserId(userId: string): Promise<UserPreferenceSummary>;
  update(input: UpdateUserPreferencesInput): Promise<UserPreferenceSummary>;
}

@Injectable()
export class UserPreferenceService {
  constructor(
    @Inject(USER_PREFERENCE_REPOSITORY)
    private readonly preferenceRepository: UserPreferenceRepository,
  ) {}

  getByUserId(userId: string): Promise<UserPreferenceSummary> {
    if (!userId.trim()) {
      throw new Error('invalid_user_preferences_request');
    }

    return this.preferenceRepository.getByUserId(userId);
  }

  update(input: UpdateUserPreferencesInput): Promise<UserPreferenceSummary> {
    if (!input.userId.trim()) {
      throw new Error('invalid_user_preferences_request');
    }

    if (input.language !== undefined && !this.isAllowedLanguage(input.language)) {
      throw new Error('invalid_user_preferences_request');
    }

    if (
      input.notificationPreferences !== undefined &&
      input.notificationPreferences !== null &&
      (Array.isArray(input.notificationPreferences) ||
        typeof input.notificationPreferences !== 'object')
    ) {
      throw new Error('invalid_user_preferences_request');
    }

    return this.preferenceRepository.update(input);
  }

  private isAllowedLanguage(language?: string | null): boolean {
    return !language || ['en', 'fil'].includes(language);
  }
}
