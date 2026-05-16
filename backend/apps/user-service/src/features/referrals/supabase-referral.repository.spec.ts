import { SupabaseReferralRepository } from './supabase-referral.repository';

describe('SupabaseReferralRepository', () => {
  it('loads and maps a referral summary through the RPC', async () => {
    const rpc = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          referral_code: 'SE-ABC12345',
          referral_link_path: '/signup?ref=SE-ABC12345',
          completed_referrals: '2',
          pending_referrals: '1',
          total_rewards: '300',
        },
        error: null,
      }),
    });
    const repository = new SupabaseReferralRepository({ rpc });

    await expect(repository.getSummary('user-1')).resolves.toEqual({
      referralCode: 'SE-ABC12345',
      referralLinkPath: '/signup?ref=SE-ABC12345',
      completedReferrals: 2,
      pendingReferrals: 1,
      totalRewards: 300,
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_referral_summary', {
      p_user_id: 'user-1',
    });
  });
});
