import { Inject, Injectable } from '@nestjs/common';
import { PasswordChangeRequest, PasswordChangeResponse } from './password-change.types';

export const PASSWORD_CHANGE_REPOSITORY = Symbol('PASSWORD_CHANGE_REPOSITORY');

export interface PasswordChangeRepository {
  changePassword(input: PasswordChangeRequest): Promise<PasswordChangeResponse>;
}

@Injectable()
export class PasswordChangeService {
  constructor(
    @Inject(PASSWORD_CHANGE_REPOSITORY)
    private readonly passwordChangeRepository: PasswordChangeRepository,
  ) {}

  changePassword(input: PasswordChangeRequest): Promise<PasswordChangeResponse> {
    return this.passwordChangeRepository.changePassword(input);
  }
}
