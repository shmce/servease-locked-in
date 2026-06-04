import { SupabaseUserRepository } from './supabase-user.repository';

describe('SupabaseUserRepository', () => {
  it('loads a user from the identity_and_user schema', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        full_name: 'Customer Name',
        contact_number: '+639000000000',
        avatar_url: 'https://storage.test/avatar.jpg',
        avatar_storage_path: 'avatar/user-1/avatar.jpg',
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
      passwordHash: '',
      fullName: 'Customer Name',
      contactNumber: '+639000000000',
      avatarUrl: 'https://storage.test/avatar.jpg',
      avatarStoragePath: 'avatar/user-1/avatar.jpg',
      role: 'customer',
      status: 'active',
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_internal_user_summary', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    });
  });

  it('anonymizes the internal user and revokes the Supabase auth user', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'deleted-9b6ed52b8a974b89b6a8364c65f8736b@deleted.servease.local',
        password_hash: 'deleted',
        full_name: null,
        contact_number: null,
        avatar_url: null,
        avatar_storage_path: null,
        role: 'customer',
        status: 'inactive',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const deleteUser = jest.fn().mockResolvedValue({ error: null });

    const repository = new SupabaseUserRepository({
      rpc,
      auth: {
        admin: {
          deleteUser,
        },
      },
    });

    await expect(
      repository.anonymizeAccount('9b6ed52b-8a97-4b89-b6a8-364c65f8736b'),
    ).resolves.toEqual({
      id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      email: 'deleted-9b6ed52b8a974b89b6a8364c65f8736b@deleted.servease.local',
      passwordHash: 'deleted',
      fullName: null,
      contactNumber: null,
      avatarUrl: null,
      avatarStoragePath: null,
      role: 'customer',
      status: 'inactive',
    });
    expect(rpc).toHaveBeenCalledWith('servease_anonymize_internal_user', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    });
    expect(deleteUser).toHaveBeenCalledWith(
      '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
    );
  });

  it('updates avatar metadata through the internal user RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        email: 'customer@example.com',
        password_hash: 'hashed-password',
        full_name: 'Customer Name',
        contact_number: '+639000000000',
        avatar_url: 'https://storage.test/avatar.jpg',
        avatar_storage_path: 'avatar/user-1/avatar.jpg',
        role: 'customer',
        status: 'active',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });

    const repository = new SupabaseUserRepository({ rpc });

    await expect(
      repository.update({
        userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        fullName: 'Customer Name',
        contactNumber: '+639000000000',
        avatarUrl: 'https://storage.test/avatar.jpg',
        avatarStoragePath: 'avatar/user-1/avatar.jpg',
      }),
    ).resolves.toMatchObject({
      avatarUrl: 'https://storage.test/avatar.jpg',
      avatarStoragePath: 'avatar/user-1/avatar.jpg',
    });
    expect(rpc).toHaveBeenCalledWith('servease_update_internal_user', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      p_full_name: 'Customer Name',
      p_contact_number: '+639000000000',
      p_avatar_url: 'https://storage.test/avatar.jpg',
      p_avatar_storage_path: 'avatar/user-1/avatar.jpg',
    });
  });

  it('persists and maps two-factor provisioning state', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        verified_at: null,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseUserRepository({ rpc });

    await expect(
      repository.beginTwoFactor(
        '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
        'JBSWY3DPEHPK3PXP',
      ),
    ).resolves.toEqual({
      userId: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      secret: 'JBSWY3DPEHPK3PXP',
      enabled: false,
      verifiedAt: null,
    });
    expect(rpc).toHaveBeenCalledWith('servease_begin_user_two_factor', {
      p_user_id: '9b6ed52b-8a97-4b89-b6a8-364c65f8736b',
      p_secret: 'JBSWY3DPEHPK3PXP',
    });
  });
});
