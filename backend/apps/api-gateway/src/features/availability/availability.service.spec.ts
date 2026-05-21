import { AvailabilityGatewayService } from './availability.service';
import { AvailabilityServiceClient } from './clients/availability-service.client';
import { BookingServiceClient } from '../booking/clients/booking-service.client';

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

    await expect(
      service.getSchedule('f87b3f7e-6b54-4cef-852f-854983780c7b'),
    ).resolves.toMatchObject({
      bookedWindows: [],
    });

    expect(client.getSchedule).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
    );
  });

  it('enriches public provider schedules with active booking windows', async () => {
    const client = {
      getSchedule: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
    } as unknown as AvailabilityServiceClient;
    const bookingClient = {
      listBookings: jest.fn().mockResolvedValue([
        {
          id: 'booking-1',
          scheduledAt: '2026-05-20T02:00:00.000Z',
          hoursRequired: 2,
          status: 'confirmed',
        },
        {
          id: 'booking-2',
          scheduledAt: '2026-05-20T06:00:00.000Z',
          hoursRequired: 1,
          status: 'cancelled',
        },
      ]),
    } as unknown as BookingServiceClient;
    const service = new AvailabilityGatewayService(client, bookingClient);

    await expect(
      service.getSchedule('f87b3f7e-6b54-4cef-852f-854983780c7b'),
    ).resolves.toMatchObject({
      bookedWindows: [
        {
          bookingId: 'booking-1',
          offDate: '2026-05-20',
          startTime: '10:00',
          endTime: '12:00',
          status: 'confirmed',
        },
      ],
    });
    expect(bookingClient.listBookings).toHaveBeenCalledWith(
      null,
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
