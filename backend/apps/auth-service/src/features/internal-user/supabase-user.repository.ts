import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { UserRepository } from './internal-user.service';
import {
  StoredUserRecord,
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
  rpc(
    functionName: string,
    args: Record<string, string | null>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabaseUserRow | null;
      error: { message: string } | null;
    }>;
  } & PromiseLike<{
    data: SupabaseSessionRow[] | null;
    error: { message: string } | null;
  }>;
}

interface SupabaseUserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  contact_number: string | null;
  role: UserRole;
  status: UserStatus;
}

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
  }

  async findById(userId: string): Promise<StoredUserRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_get_internal_user', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      fullName: data.full_name,
      contactNumber: data.contact_number,
      role: data.role,
      status: data.status,
    };
  }

  async update(input: UpdateInternalUserInput): Promise<StoredUserRecord | null> {
    const { data, error } = await this.client
      .rpc('servease_update_internal_user', {
        p_user_id: input.userId,
        p_full_name: input.fullName,
        p_contact_number: input.contactNumber ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      fullName: data.full_name,
      contactNumber: data.contact_number,
      role: data.role,
      status: data.status,
    };
  }

  async listSessions(userId: string): Promise<UserSessionRecord[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_user_sessions',
      { p_user_id: userId },
    );

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      email: row.email ?? '',
      createdAt: row.created_at,
      lastSignInAt: row.last_sign_in_at,
    }));
  }
}
