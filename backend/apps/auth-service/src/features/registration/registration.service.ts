import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserInput, RegisteredUserResponse } from './registration.types';

export const REGISTRATION_REPOSITORY = Symbol('REGISTRATION_REPOSITORY');

export interface RegistrationRepository {
  register(input: RegisterUserInput): Promise<RegisteredUserResponse>;
  deleteUser(userId: string): Promise<void>;
}

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  register(input: RegisterUserInput): Promise<RegisteredUserResponse> {
    return this.registrationRepository.register(input);
  }

  deleteUser(userId: string): Promise<void> {
    return this.registrationRepository.deleteUser(userId);
  }
}
