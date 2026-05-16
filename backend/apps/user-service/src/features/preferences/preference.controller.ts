import { Body, Controller, Get, HttpException, Param, Put } from '@nestjs/common';
import { UserPreferenceService } from './preference.service';
import {
  UpdateUserPreferencesInput,
  UserPreferenceSummary,
} from './preference.types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('internal/users')
export class UserPreferenceController {
  constructor(private readonly preferenceService: UserPreferenceService) {}

  @Get(':userId/preferences')
  async show(@Param('userId') userId: string): Promise<{
    data: UserPreferenceSummary;
  }> {
    if (!UUID_PATTERN.test(userId)) {
      throw this.error(
        'invalid_user_preferences_request',
        'User preferences request is invalid.',
        400,
      );
    }

    try {
      return {
        data: await this.preferenceService.getByUserId(userId),
      };
    } catch {
      throw this.error(
        'user_preferences_dependency_unavailable',
        'User preferences lookup failed.',
        503,
      );
    }
  }

  @Put(':userId/preferences')
  async update(
    @Param('userId') userId: string,
    @Body() body: Omit<UpdateUserPreferencesInput, 'userId'>,
  ): Promise<{ data: UserPreferenceSummary }> {
    if (
      !UUID_PATTERN.test(userId) ||
      !this.isAllowedLanguage(body.language) ||
      !this.isObjectPreference(body.notificationPreferences)
    ) {
      throw this.error(
        'invalid_user_preferences_request',
        'User preferences request is invalid.',
        400,
      );
    }

    try {
      return {
        data: await this.preferenceService.update({
          userId,
          pushNotificationsEnabled: body.pushNotificationsEnabled,
          darkModeEnabled: body.darkModeEnabled,
          language: body.language,
          notificationPreferences: body.notificationPreferences,
        }),
      };
    } catch {
      throw this.error(
        'user_preferences_dependency_unavailable',
        'User preferences update failed.',
        503,
      );
    }
  }

  private isAllowedLanguage(language?: string | null): boolean {
    return !language || ['en', 'fil'].includes(language);
  }

  private isObjectPreference(value?: unknown): boolean {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'object' && !Array.isArray(value))
    );
  }

  private error(code: string, message: string, status: number): HttpException {
    return new HttpException(
      {
        error: {
          code,
          message,
          details: {},
        },
      },
      status,
    );
  }
}
