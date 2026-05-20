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
        timeOffWindows: [],
      }),
      addDayOff: jest.fn(),
      removeDayOff: jest.fn(),
      addTimeOffWindow: jest.fn(),
      removeTimeOffWindow: jest.fn(),
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
      addTimeOffWindow: jest.fn(),
      removeTimeOffWindow: jest.fn(),
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

  it('adds a valid partial time-off window for a provider', async () => {
    const repository: ProviderAvailabilityRepository = {
      getSchedule: jest.fn(),
      replaceWindows: jest.fn(),
      addDayOff: jest.fn(),
      removeDayOff: jest.fn(),
      addTimeOffWindow: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
      removeTimeOffWindow: jest.fn(),
    };
    const service = new ProviderAvailabilityService(repository);

    await service.addTimeOffWindow('f87b3f7e-6b54-4cef-852f-854983780c7b', {
      offDate: '2026-05-24',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Personal errand',
    });

    expect(repository.addTimeOffWindow).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
      {
        offDate: '2026-05-24',
        startTime: '14:00',
        endTime: '17:00',
        reason: 'Personal errand',
      },
    );
  });

  it('rejects invalid partial time-off windows before writing', async () => {
    const repository: ProviderAvailabilityRepository = {
      getSchedule: jest.fn(),
      replaceWindows: jest.fn(),
      addDayOff: jest.fn(),
      removeDayOff: jest.fn(),
      addTimeOffWindow: jest.fn(),
      removeTimeOffWindow: jest.fn(),
    };
    const service = new ProviderAvailabilityService(repository);

    expect(() =>
      service.addTimeOffWindow('f87b3f7e-6b54-4cef-852f-854983780c7b', {
        offDate: '2026-05-24',
        startTime: '17:00',
        endTime: '14:00',
        reason: null,
      }),
    ).toThrow(InvalidAvailabilityRequestError);
    expect(repository.addTimeOffWindow).not.toHaveBeenCalled();
  });
});
