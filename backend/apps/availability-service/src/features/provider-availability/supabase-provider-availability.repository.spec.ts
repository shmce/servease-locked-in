import { SupabaseProviderAvailabilityRepository } from './supabase-provider-availability.repository';

describe('SupabaseProviderAvailabilityRepository', () => {
  it('loads a provider schedule through RPC and maps the response', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: {
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [
          {
            id: '2ea0a77d-6343-4758-aa7b-2c844c3daf04',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
            sortOrder: 1,
          },
        ],
        daysOff: [],
      },
      error: null,
    });
    const repository = new SupabaseProviderAvailabilityRepository({ rpc });

    await expect(
      repository.getSchedule('f87b3f7e-6b54-4cef-852f-854983780c7b'),
    ).resolves.toEqual({
      providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
      windows: [
        {
          id: '2ea0a77d-6343-4758-aa7b-2c844c3daf04',
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          sortOrder: 1,
        },
      ],
      daysOff: [],
    });
    expect(rpc).toHaveBeenCalledWith('servease_get_provider_availability', {
      p_provider_id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
    });
  });

  it('replaces weekly windows through RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: {
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
      },
      error: null,
    });
    const repository = new SupabaseProviderAvailabilityRepository({ rpc });

    await repository.replaceWindows('f87b3f7e-6b54-4cef-852f-854983780c7b', [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      },
    ]);

    expect(rpc).toHaveBeenCalledWith('servease_replace_provider_availability_windows', {
      p_provider_id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
      p_windows: [
        {
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    });
  });
});
