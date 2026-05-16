import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { ReferralRepository } from './referral.service';
import { ReferralSummary } from './referral.types';

interface SupabaseReferralClient {
  rpc(
    functionName: string,
    args: Record<string, string>,
  ): {
    maybeSingle(): PromiseLike<{
      data: SupabaseReferralSummaryRow | null;
      error: { message: string } | null;
    }>;
  };
}

interface SupabaseReferralSummaryRow {
  referral_code: string;
  referral_link_path: string;
  completed_referrals: number | string;
  pending_referrals: number | string;
  total_rewards: number | string;
}

@Injectable()
export class SupabaseReferralRepository implements ReferralRepository {
  private readonly client: SupabaseReferralClient;

  constructor(client?: SupabaseReferralClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseReferralClient);
  }

  async getSummary(userId: string): Promise<ReferralSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_referral_summary', {
        p_user_id: userId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load referral summary: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to load referral summary: missing row');
    }

    return {
      referralCode: data.referral_code,
      referralLinkPath: data.referral_link_path,
      completedReferrals: Number(data.completed_referrals),
      pendingReferrals: Number(data.pending_referrals),
      totalRewards: Number(data.total_rewards),
    };
  }
}
