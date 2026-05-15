import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CurrentUserIdentity,
  UserRole,
  UserStatus,
} from '../current-user.types';
import {
  ProfileDependencyUnavailableError,
  UserNotFoundError,
} from '../current-user.errors';

@Injectable()
export class AuthServiceClient {
  constructor(private readonly configService: ConfigService) {}

  async findUserById(userId: string): Promise<CurrentUserIdentity> {
    const baseUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:8501',
    );
    const response = await fetch(`${baseUrl}/internal/users/${userId}`);

    if (response.status === 404) {
      throw new UserNotFoundError();
    }

    if (!response.ok) {
      throw new ProfileDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: CurrentUserIdentity };
    return {
      id: payload.data.id,
      email: payload.data.email,
      fullName: payload.data.fullName,
      contactNumber: payload.data.contactNumber,
      role: payload.data.role as UserRole,
      status: payload.data.status as UserStatus,
    };
  }
}
