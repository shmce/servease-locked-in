import { SupabaseProviderProfileRepository } from './supabase-provider-profile.repository';

describe('SupabaseProviderProfileRepository', () => {
  it('loads a provider profile from the provider_catalog schema', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        business_name: 'Reliable Repairs',
        verification_status: 'approved',
        average_rating: 4.8,
        review_count: 12,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });

    const repository = new SupabaseProviderProfileRepository({ rpc });

    await expect(
      repository.findByUserId('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
      businessName: 'Reliable Repairs',
      verificationStatus: 'approved',
      averageRating: 4.8,
      reviewCount: 12,
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_provider_profile', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    });
  });
});
