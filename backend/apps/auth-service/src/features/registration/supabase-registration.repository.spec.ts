import { SupabaseRegistrationRepository } from './supabase-registration.repository';

describe('SupabaseRegistrationRepository', () => {
  it('persists provider birthdate in auth metadata and internal user RPC', async () => {
    const createUser = jest.fn().mockResolvedValue({
      data: { user: { id: 'user-1', email: 'provider@example.com' } },
      error: null,
    });
    const deleteUser = jest.fn().mockResolvedValue({ error: null });
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'provider@example.com',
        password_hash: 'managed_by_supabase_auth',
        full_name: 'Provider Example',
        contact_number: '+639171234567',
        role: 'provider',
        status: 'active',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseRegistrationRepository({
      auth: { admin: { createUser, deleteUser } },
      rpc,
    });

    await repository.register({
      role: 'provider',
      email: ' Provider@Example.com ',
      password: 'Password#2026',
      fullName: ' Provider Example ',
      contactNumber: ' +639171234567 ',
      birthdate: '1990-05-23',
    });

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        user_metadata: expect.objectContaining({
          birthdate: '1990-05-23',
        }),
      }),
    );
    expect(rpc).toHaveBeenCalledWith(
      'servease_register_internal_user',
      expect.objectContaining({
        p_birthdate: '1990-05-23',
      }),
    );
  });
});
