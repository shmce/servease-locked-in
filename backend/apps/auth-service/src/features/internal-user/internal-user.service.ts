import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from './internal-user.errors';
import { presentInternalUser } from './user-presenter';
import {
  InternalUserResponse,
  StoredUserRecord,
  UpdateInternalUserInput,
} from './user.types';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(userId: string): Promise<StoredUserRecord | null>;
  update(input: UpdateInternalUserInput): Promise<StoredUserRecord | null>;
}

@Injectable()
export class EmptyUserRepository implements UserRepository {
  async findById(): Promise<StoredUserRecord | null> {
    return null;
  }

  async update(): Promise<StoredUserRecord | null> {
    return null;
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
}
