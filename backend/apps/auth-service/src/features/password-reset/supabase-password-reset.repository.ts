import { Injectable } from '@nestjs/common';
import { createSupabaseAuthClient } from '../../../../../libs/common/src';
import { PasswordResetDependencyUnavailableError } from './password-reset.errors';
import { PasswordResetRequest, PasswordResetResponse } from './password-reset.types';

interface SupabasePasswordResetClient {
  auth: {
    resetPasswordForEmail(
      email: string,
      options?: { redirectTo?: string },
    ): PromiseLike<{
      error: { message: string } | null;
    }>;
  };
}

@Injectable()
export class SupabasePasswordResetRepository {
  private readonly client: SupabasePasswordResetClient;

  constructor(client?: SupabasePasswordResetClient) {
    this.client =
      client ?? (createSupabaseAuthClient() as unknown as SupabasePasswordResetClient);
  }

  async requestReset(
    input: PasswordResetRequest,
  ): Promise<PasswordResetResponse> {
    const redirectTo =
      input.redirectTo?.trim() ||
      process.env.PASSWORD_RESET_REDIRECT_URL?.trim() ||
      undefined;
    const { error } = await this.client.auth.resetPasswordForEmail(
      input.email.trim().toLowerCase(),
      redirectTo ? { redirectTo } : undefined,
    );

    if (error) {
      throw new PasswordResetDependencyUnavailableError();
    }

    return { ok: true };
  }
}
