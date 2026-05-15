import { InvalidAvailabilityRequestError } from './provider-availability.errors';
import {
  ProviderAvailabilityRepository,
  ProviderAvailabilityService,
} from './provider-availability.service';

describe('ProviderAvailabilityService', () => {
  it('replaces valid weekly windows for a provider', async () => {
    const repository: ProviderAvailabilityRepository = {
      getSchedule: jest.fn(),
      replaceWindows: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
      }),
      addDayOff: jest.fn(),
      removeDayOff: jest.fn(),
    };
    const service = new ProviderAvailabilityService(repository);

    await service.replaceWindows('f87b3f7e-6b54-4cef-852f-854983780c7b', [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      },
    ]);

    expect(repository.replaceWindows).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
      [
        {
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    );
  });

  it('rejects invalid weekly windows before writing', async () => {
    const repository: ProviderAvailabilityRepository = {
      getSchedule: jest.fn(),
      replaceWindows: jest.fn(),
      addDayOff: jest.fn(),
      removeDayOff: jest.fn(),
    };
    const service = new ProviderAvailabilityService(repository);

    await expect(
      service.replaceWindows('f87b3f7e-6b54-4cef-852f-854983780c7b', [
        {
          dayOfWeek: 'monday',
          startTime: '17:00',
          endTime: '09:00',
        },
      ]),
    ).rejects.toBeInstanceOf(InvalidAvailabilityRequestError);
    expect(repository.replaceWindows).not.toHaveBeenCalled();
  });
});
