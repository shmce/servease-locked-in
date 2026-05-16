import { Injectable } from '@nestjs/common';
import {
  createSupabaseAuthClient,
  createSupabaseServiceClient,
} from '../../../../../libs/common/src';
import {
  InvalidPasswordChangeRequestError,
  PasswordChangeDependencyUnavailableError,
} from './password-change.errors';
import { PasswordChangeRequest, PasswordChangeResponse } from './password-change.types';

interface SupabasePasswordVerifierClient {
  auth: {
    signInWithPassword(input: {
      email: string;
      password: string;
    }): PromiseLike<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
}

interface SupabasePasswordAdminClient {
  auth: {
    admin: {
      updateUserById(
        userId: string,
        input: { password: string },
      ): PromiseLike<{
        data: { user: { id: string } | null };
        error: { message: string } | null;
      }>;
    };
  };
}

@Injectable()
export class SupabasePasswordChangeRepository {
  private readonly verifierClient: SupabasePasswordVerifierClient;
  private readonly adminClient: SupabasePasswordAdminClient;

  constructor(
    verifierClient?: SupabasePasswordVerifierClient,
    adminClient?: SupabasePasswordAdminClient,
  ) {
    this.verifierClient =
      verifierClient ??
      (createSupabaseAuthClient() as unknown as SupabasePasswordVerifierClient);
    this.adminClient =
      adminClient ??
      (createSupabaseServiceClient() as unknown as SupabasePasswordAdminClient);
  }

  async changePassword(
    input: PasswordChangeRequest,
  ): Promise<PasswordChangeResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const { data: verificationData, error: verificationError } =
      await this.verifierClient.auth.signInWithPassword({
        email: normalizedEmail,
        password: input.currentPassword,
      });

    if (verificationError || verificationData.user?.id !== input.userId) {
      throw new InvalidPasswordChangeRequestError();
    }

    const { data, error } = await this.adminClient.auth.admin.updateUserById(
      input.userId,
      {
        password: input.newPassword,
      },
    );

    if (error) {
      throw new PasswordChangeDependencyUnavailableError();
    }

    if (data.user?.id !== input.userId) {
      throw new PasswordChangeDependencyUnavailableError();
    }

    return { ok: true };
  }
}
