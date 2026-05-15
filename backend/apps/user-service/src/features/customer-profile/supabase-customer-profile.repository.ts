import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { CustomerProfileRepository } from './customer-profile.service';
import { CustomerProfileSummary } from './customer-profile.types';

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, string>,
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
}
