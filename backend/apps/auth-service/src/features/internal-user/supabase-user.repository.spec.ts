import { SupabaseUserRepository } from './supabase-user.repository';

describe('SupabaseUserRepository', () => {
  it('loads a user from the identity_and_user schema', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        password_hash: 'hashed-password',
        full_name: 'Customer Name',
        contact_number: '+639000000000',
        role: 'customer',
        status: 'active',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });

    const repository = new SupabaseUserRepository({ rpc });

    await expect(
      repository.findById('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      email: 'customer@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Customer Name',
      contactNumber: '+639000000000',
      role: 'customer',
      status: 'active',
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_internal_user', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    });
  });
});
