import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ProviderProfileRepository } from './provider-profile.service';
import { ProviderProfileSummary } from './provider-profile.types';

interface SupabaseQueryClient {
  rpc(
    functionName: string,
    args: Record<string, string>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabaseProviderProfileRow | null;
      error: { message: string } | null;
    }>;
  };
}

interface SupabaseProviderProfileRow {
  id: string;
  business_name: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  average_rating: number | string | null;
  review_count: number | null;
}

@Injectable()
export class SupabaseProviderProfileRepository
  implements ProviderProfileRepository
{
  private readonly client: SupabaseQueryClient;

  constructor(client?: SupabaseQueryClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseQueryClient);
  }

  async findByUserId(userId: string): Promise<ProviderProfileSummary | null> {
    const { data, error } = await this.client
      .rpc('servease_get_provider_profile', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load provider profile: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      businessName: data.business_name,
      verificationStatus: data.verification_status,
      averageRating: Number(data.average_rating ?? 0),
      reviewCount: data.review_count ?? 0,
    };
  }
}
