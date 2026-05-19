import { AvailabilityGatewayService } from './availability.service';
import { AvailabilityServiceClient } from './clients/availability-service.client';

describe('AvailabilityGatewayService', () => {
  it('loads a public provider schedule by provider id', async () => {
    const client = {
      getSchedule: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
    } as unknown as AvailabilityServiceClient;
    const service = new AvailabilityGatewayService(client);

    await service.getSchedule('f87b3f7e-6b54-4cef-852f-854983780c7b');

    expect(client.getSchedule).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
    );
  });

  it('forwards provider profile ids when replacing windows', async () => {
    const client = {
      replaceWindows: jest.fn().mockResolvedValue({
          providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
          windows: [],
          daysOff: [],
          timeOffWindows: [],
      }),
    } as unknown as AvailabilityServiceClient;
    const service = new AvailabilityGatewayService(client);

    await service.replaceWindows('f87b3f7e-6b54-4cef-852f-854983780c7b', [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
      },
    ]);

    expect(client.replaceWindows).toHaveBeenCalledWith(
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

  it('forwards provider profile ids when adding time off', async () => {
    const client = {
      addTimeOffWindow: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
    } as unknown as AvailabilityServiceClient;
    const service = new AvailabilityGatewayService(client);

    await service.addTimeOffWindow('f87b3f7e-6b54-4cef-852f-854983780c7b', {
      offDate: '2026-05-24',
      startTime: '14:00',
      endTime: '17:00',
      reason: null,
    });

    expect(client.addTimeOffWindow).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
      {
        offDate: '2026-05-24',
        startTime: '14:00',
        endTime: '17:00',
        reason: null,
      },
    );
  });
});
