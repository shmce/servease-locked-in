import { SupabaseCustomerProfileRepository } from './supabase-customer-profile.repository';

describe('SupabaseCustomerProfileRepository', () => {
  it('loads a customer profile from the identity_and_user schema', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
        address: 'Primary saved address',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });

    const repository = new SupabaseCustomerProfileRepository({ rpc });

    await expect(
      repository.findByUserId('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: 'd1810af8-6172-4582-b1d8-b292ee37233a',
      address: 'Primary saved address',
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_customer_profile', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    });
  });
});
