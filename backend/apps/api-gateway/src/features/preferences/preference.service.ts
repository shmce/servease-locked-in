import { Injectable } from '@nestjs/common';
import { UserServiceClient } from '../current-user/clients/user-service.client';
import {
  UpdateUserPreferencesRequest,
  UserPreferenceSummary,
} from './preference.types';

@Injectable()
export class UserPreferenceGatewayService {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  getPreferences(userId: string): Promise<UserPreferenceSummary> {
    return this.userServiceClient.getUserPreferences(userId);
  }

  updatePreferences(
    userId: string,
    input: UpdateUserPreferencesRequest,
  ): Promise<UserPreferenceSummary> {
    return this.userServiceClient.updateUserPreferences(userId, input);
  }
}
