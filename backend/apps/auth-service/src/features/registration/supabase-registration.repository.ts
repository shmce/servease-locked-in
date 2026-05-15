import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { presentInternalUser } from '../internal-user/user-presenter';
import { StoredUserRecord } from '../internal-user/user.types';
import {
  InvalidRegistrationRequestError,
  RegistrationConflictError,
} from './registration.errors';
import { RegisterUserInput, RegisteredUserResponse } from './registration.types';

interface SupabaseRegistrationClient {
  auth: {
    admin: {
      createUser(input: {
        email: string;
        password: string;
        email_confirm: boolean;
        user_metadata: Record<string, string | null>;
      }): PromiseLike<{
        data: { user: { id: string; email?: string | null } | null };
        error: { message: string; status?: number } | null;
      }>;
      deleteUser(userId: string): PromiseLike<{
        error: { message: string } | null;
      }>;
    };
  };
  rpc(
    functionName: string,
    args: Record<string, string | null>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabaseUserRow | null;
      error: { message: string; code?: string } | null;
    }>;
  } & PromiseLike<{
    data: null;
    error: { message: string; code?: string } | null;
  }>;
}

interface SupabaseUserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  contact_number: string | null;
  role: StoredUserRecord['role'];
  status: StoredUserRecord['status'];
}

@Injectable()
export class SupabaseRegistrationRepository {
  private readonly client: SupabaseRegistrationClient;

  constructor(client?: SupabaseRegistrationClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRegistrationClient);
  }

  async register(input: RegisterUserInput): Promise<RegisteredUserResponse> {
    const { data: authData, error: authError } =
      await this.client.auth.admin.createUser({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.fullName.trim(),
          contact_number: input.contactNumber?.trim() || null,
          role: input.role,
        },
      });

    if (authError) {
      if (authError.status === 422 || authError.message.includes('already')) {
        throw new RegistrationConflictError();
      }
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('Failed to create auth user: missing user id');
    }

    try {
      const { data, error } = await this.client
        .rpc('servease_register_internal_user', {
          p_user_id: userId,
          p_email: input.email.trim().toLowerCase(),
          p_full_name: input.fullName.trim(),
          p_contact_number: input.contactNumber?.trim() || null,
          p_role: input.role,
        })
        .maybeSingle();

      if (error) {
        if (this.isConflict(error.message)) {
          throw new RegistrationConflictError();
        }
        if (error.message.includes('invalid_registration_role')) {
          throw new InvalidRegistrationRequestError();
        }
        throw new Error(`Failed to create internal user: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create internal user: missing user row');
      }

      return presentInternalUser({
        id: data.id,
        email: data.email,
        passwordHash: data.password_hash,
        fullName: data.full_name,
        contactNumber: data.contact_number,
        role: data.role,
        status: data.status,
      });
    } catch (error) {
      await this.deleteAuthUser(userId);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.rpc('servease_delete_internal_user', {
      p_user_id: userId,
    });
    await this.deleteAuthUser(userId);
  }

  private async deleteAuthUser(userId: string): Promise<void> {
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Failed to delete auth user: ${error.message}`);
    }
  }

  private isConflict(message: string): boolean {
    return message.includes('duplicate key') || message.includes('already');
  }
}
