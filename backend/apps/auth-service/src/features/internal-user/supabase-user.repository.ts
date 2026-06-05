import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { UserRepository } from './internal-user.service';
import {
  StoredUserRecord,
  TwoFactorStateRecord,
  UpdateInternalUserInput,
  UserRole,
  UserSessionRecord,
  UserStatus,
} from './user.types';

interface SupabaseSessionRow {
  id: string;
  created_at: string | null;
  last_sign_in_at: string | null;
  email: string | null;
}

interface SupabaseQueryClient {
  auth?: {
    admin: {
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
      data: SupabaseUserRow | SupabaseTwoFactorRow | null;
      error: { message: string } | null;
    }>;
  } & PromiseLike<{
    data: SupabaseSessionRow[] | SupabaseTwoFactorRow[] | null;
    error: { message: string } | null;
  }>;
}

interface SupabaseUserRow {
  id: string;
  email: string;
  password_hash?: string | null;
  full_name: string | null;
  contact_number: string | null;
  avatar_url?: string | null;
  avatar_storage_path?: string | null;
  role: UserRole;
  status: UserStatus;
}

interface SupabaseTwoFactorRow {
  user_id: string;
  secret: string | null;
  enabled: boolean | null;
  verified_at: string | null;
}

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
  }

  async findById(userId: string): Promise<StoredUserRecord | null> {
    let { data, error } = await this.client
      .rpc('servease_get_internal_user_summary', {
        p_user_id: userId,
      })
      .maybeSingle();
    if (this.isMissingRpcError(error, 'servease_get_internal_user_summary')) {
      ({ data, error } = await this.client
        .rpc('servease_get_internal_user', {
          p_user_id: userId,
        })
        .maybeSingle());
    }

    if (error) {
      throw new Error(`Failed to load user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapUser(data as SupabaseUserRow);
  }

  async update(input: UpdateInternalUserInput): Promise<StoredUserRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_update_internal_user', {
        p_user_id: input.userId,
        p_full_name: input.fullName,
        p_contact_number: input.contactNumber ?? null,
        p_avatar_url: input.avatarUrl ?? null,
        p_avatar_storage_path: input.avatarStoragePath ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return this.mapUser(data as SupabaseUserRow);
  }

  async anonymizeAccount(userId: string): Promise<StoredUserRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_anonymize_internal_user', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('user_not_found')) {
        return null;
      }
      throw new Error(`Failed to anonymize user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    if (!this.client.auth) {
      throw new Error('Failed to delete auth user: auth admin client unavailable');
    }

    const { error: authError } = await this.client.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    return this.mapUser(data as SupabaseUserRow);
  }

  async listSessions(userId: string): Promise<UserSessionRecord[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_user_sessions',
      { p_user_id: userId },
    );

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    return ((data ?? []) as SupabaseSessionRow[]).map((row) => ({
      id: row.id,
      email: row.email ?? '',
      createdAt: row.created_at,
      lastSignInAt: row.last_sign_in_at,
    }));
  }

  async beginTwoFactor(
    userId: string,
    secret: string,
  ): Promise<TwoFactorStateRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_begin_user_two_factor', {
        p_user_id: userId,
        p_secret: secret,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('user_not_found')) {
        return null;
      }
      throw new Error(`Failed to begin two-factor auth: ${error.message}`);
    }

    return data ? this.mapTwoFactor(data as SupabaseTwoFactorRow) : null;
  }

  async confirmTwoFactor(userId: string): Promise<TwoFactorStateRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_confirm_user_two_factor', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('user_not_found')) {
        return null;
      }
      throw new Error(`Failed to confirm two-factor auth: ${error.message}`);
    }

    return data ? this.mapTwoFactor(data as SupabaseTwoFactorRow) : null;
  }

  async disableTwoFactor(userId: string): Promise<TwoFactorStateRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_disable_user_two_factor', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('user_not_found')) {
        return null;
      }
      throw new Error(`Failed to disable two-factor auth: ${error.message}`);
    }

    return data ? this.mapTwoFactor(data as SupabaseTwoFactorRow) : null;
  }

  async getTwoFactor(userId: string): Promise<TwoFactorStateRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_get_user_two_factor', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load two-factor auth: ${error.message}`);
    }

    return data ? this.mapTwoFactor(data as SupabaseTwoFactorRow) : null;
  }

  private mapTwoFactor(row: SupabaseTwoFactorRow): TwoFactorStateRecord {
    return {
      userId: row.user_id,
      secret: row.secret,
      enabled: row.enabled ?? false,
      verifiedAt: row.verified_at,
    };
  }

  private mapUser(row: SupabaseUserRow): StoredUserRecord {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash ?? '',
      fullName: row.full_name,
      contactNumber: row.contact_number,
      avatarUrl: row.avatar_url ?? null,
      avatarStoragePath: row.avatar_storage_path ?? null,
      role: row.role,
      status: row.status,
    };
  }

  private isMissingRpcError(
    error: { message: string; code?: string } | null,
    functionName: string,
  ): boolean {
    return (
      error?.code === '42883' ||
      error?.message.toLowerCase().includes(functionName.toLowerCase()) === true
    );
  }
}
