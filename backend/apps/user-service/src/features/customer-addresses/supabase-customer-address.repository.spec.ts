import { SupabaseCustomerAddressRepository } from './supabase-customer-address.repository';

describe('SupabaseCustomerAddressRepository', () => {
  it('maps saved address rows from the identity_and_user schema', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'address-1',
          user_id: 'user-1',
          label: 'Home',
          address: '123 Test St',
          barangay: null,
          city: 'Manila',
          province: null,
          region: 'NCR',
          latitude: '14.5995',
          longitude: '120.9842',
          is_default: true,
          created_at: '2026-05-23T00:00:00.000Z',
          updated_at: '2026-05-23T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabaseCustomerAddressRepository({ rpc });

    await expect(repository.listByUserId('user-1')).resolves.toEqual([
      {
        id: 'address-1',
        userId: 'user-1',
        label: 'Home',
        address: '123 Test St',
        barangay: null,
        city: 'Manila',
        province: null,
        region: 'NCR',
        latitude: 14.5995,
        longitude: 120.9842,
        isDefault: true,
        createdAt: '2026-05-23T00:00:00.000Z',
        updatedAt: '2026-05-23T00:00:00.000Z',
      },
    ]);
    expect(rpc).toHaveBeenCalledWith('servease_list_customer_addresses', {
      p_user_id: 'user-1',
    });
  });

  it('creates a default home address through the service-role RPC', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'address-1',
        user_id: 'user-1',
        label: 'Home',
        address: '123 Test St',
        barangay: null,
        city: null,
        province: null,
        region: null,
        latitude: null,
        longitude: null,
        is_default: true,
        created_at: null,
        updated_at: null,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ single });
    const repository = new SupabaseCustomerAddressRepository({ rpc });

    await repository.create({
      userId: 'user-1',
      label: 'Home',
      address: '123 Test St',
      isDefault: true,
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_customer_address', {
      p_user_id: 'user-1',
      p_label: 'Home',
      p_address: '123 Test St',
      p_barangay: null,
      p_city: null,
      p_province: null,
      p_region: null,
      p_latitude: null,
      p_longitude: null,
      p_is_default: true,
    });
  });
});
