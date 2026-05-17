import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from './internal-user.errors';
import { presentInternalUser } from './user-presenter';
import {
  InternalUserResponse,
  StoredUserRecord,
  UpdateInternalUserInput,
  UserSessionRecord,
} from './user.types';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(userId: string): Promise<StoredUserRecord | null>;
  update(input: UpdateInternalUserInput): Promise<StoredUserRecord | null>;
  listSessions?(userId: string): Promise<UserSessionRecord[]>;
}

@Injectable()
export class EmptyUserRepository implements UserRepository {
  async findById(): Promise<StoredUserRecord | null> {
    return null;
  }

  async update(): Promise<StoredUserRecord | null> {
    return null;
  }

  async listSessions(): Promise<UserSessionRecord[]> {
    return [];
  }
}

@Injectable()
export class InternalUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findById(userId: string): Promise<InternalUserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return presentInternalUser(user);
  }

  async update(input: UpdateInternalUserInput): Promise<InternalUserResponse> {
    const user = await this.userRepository.update(input);

    if (!user) {
      throw new UserNotFoundError();
    }

    return presentInternalUser(user);
  }

  async listSessions(userId: string): Promise<UserSessionRecord[]> {
    if (!this.userRepository.listSessions) {
      return [];
    }
    return this.userRepository.listSessions(userId);
  }
}
