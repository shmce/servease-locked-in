import { Inject, Injectable } from '@nestjs/common';
import { PasswordResetRequest, PasswordResetResponse } from './password-reset.types';

export const PASSWORD_RESET_REPOSITORY = Symbol('PASSWORD_RESET_REPOSITORY');

export interface PasswordResetRepository {
  requestReset(input: PasswordResetRequest): Promise<PasswordResetResponse>;
}

@Injectable()
export class PasswordResetService {
  constructor(
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  requestReset(input: PasswordResetRequest): Promise<PasswordResetResponse> {
    return this.passwordResetRepository.requestReset(input);
  }
}
