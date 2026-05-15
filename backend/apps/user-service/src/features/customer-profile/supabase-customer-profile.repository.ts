import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { CustomerProfileRepository } from './customer-profile.service';
import {
  CreateCustomerProfileInput,
  CustomerProfileSummary,
  UpdateCustomerProfileInput,
} from './customer-profile.types';

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, string | null>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabaseCustomerProfileRow | null;
      error: { message: string } | null;
    }>;
  };
}

interface SupabaseCustomerProfileRow {
  id: string;
  address: string | null;
}

@Injectable()
export class SupabaseCustomerProfileRepository
  implements CustomerProfileRepository
{
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
  }

  async findByUserId(userId: string): Promise<CustomerProfileSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_get_customer_profile', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load customer profile: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      address: data.address,
    };
  }

  async create(input: CreateCustomerProfileInput): Promise<CustomerProfileSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_customer_profile', {
        p_user_id: input.userId,
        p_address: input.address?.trim() || null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create customer profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create customer profile: missing profile row');
    }

    return {
      id: data.id,
      address: data.address,
    };
  }

  async update(input: UpdateCustomerProfileInput): Promise<CustomerProfileSummary> {
    const { data, error } = await this.client
      .rpc('servease_update_customer_profile', {
        p_user_id: input.userId,
        p_address: input.address?.trim() || null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update customer profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update customer profile: missing profile row');
    }

    return {
      id: data.id,
      address: data.address,
    };
  }
}
