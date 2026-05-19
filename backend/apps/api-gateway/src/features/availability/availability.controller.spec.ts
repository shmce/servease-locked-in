import { HttpException } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityGatewayService } from './availability.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import {
  TimeOffConflictsBookingError,
  TimeOffTooSoonError,
} from './availability.errors';

describe('AvailabilityController', () => {
  it('exposes public provider availability by provider id', async () => {
    const availabilityGatewayService = {
      getSchedule: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
    } as unknown as AvailabilityGatewayService;
    const controller = new AvailabilityController(
      availabilityGatewayService,
      {} as AuthTokenService,
      {} as CatalogServiceClient,
    );

    await expect(
      controller.publicShow('f87b3f7e-6b54-4cef-852f-854983780c7b'),
    ).resolves.toEqual({
      data: {
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      },
    });
    expect(availabilityGatewayService.getSchedule).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
    );
  });

  it('rejects malformed public provider ids before calling the service', async () => {
    const availabilityGatewayService = {
      getSchedule: jest.fn(),
    } as unknown as AvailabilityGatewayService;
    const controller = new AvailabilityController(
      availabilityGatewayService,
      {} as AuthTokenService,
      {} as CatalogServiceClient,
    );

    await expect(controller.publicShow('not-a-provider-id')).rejects.toBeInstanceOf(
      HttpException,
    );
    await controller.publicShow('not-a-provider-id').catch((error: HttpException) => {
      expect(error.getStatus()).toBe(400);
    });
    expect(availabilityGatewayService.getSchedule).not.toHaveBeenCalled();
  });

  it('adds partial time-off for the authenticated provider profile', async () => {
    const availabilityGatewayService = {
      addTimeOffWindow: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
        timeOffWindows: [],
      }),
    } as unknown as AvailabilityGatewayService;
    const controller = new AvailabilityController(
      availabilityGatewayService,
      {
        authenticate: jest
          .fn()
          .mockResolvedValue('11927c34-28a0-44c4-a739-816d232db0b0'),
      } as unknown as AuthTokenService,
      {
        findProviderProfileByUserId: jest.fn().mockResolvedValue({
          id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        }),
      } as unknown as CatalogServiceClient,
    );

    await controller.addTimeOff('Bearer token', {
      offDate: '2026-05-24',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Personal errand',
    });

    expect(availabilityGatewayService.addTimeOffWindow).toHaveBeenCalledWith(
      'f87b3f7e-6b54-4cef-852f-854983780c7b',
      {
        offDate: '2026-05-24',
        startTime: '14:00',
        endTime: '17:00',
        reason: 'Personal errand',
      },
    );
  });

  it.each([
    [new TimeOffTooSoonError(), 422, 'time_off_too_soon'],
    [new TimeOffConflictsBookingError(), 409, 'time_off_conflicts_booking'],
  ])('maps %s to the expected public response', async (domainError, status, code) => {
    const availabilityGatewayService = {
      addTimeOffWindow: jest.fn().mockRejectedValue(domainError),
    } as unknown as AvailabilityGatewayService;
    const controller = new AvailabilityController(
      availabilityGatewayService,
      {
        authenticate: jest
          .fn()
          .mockResolvedValue('11927c34-28a0-44c4-a739-816d232db0b0'),
      } as unknown as AuthTokenService,
      {
        findProviderProfileByUserId: jest.fn().mockResolvedValue({
          id: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        }),
      } as unknown as CatalogServiceClient,
    );

    await controller
      .addTimeOff('Bearer token', {
        offDate: '2026-05-24',
        startTime: '14:00',
        endTime: '17:00',
        reason: null,
      })
      .catch((error: HttpException) => {
        expect(error.getStatus()).toBe(status);
        expect(error.getResponse()).toMatchObject({
          error: {
            code,
          },
        });
      });
  });
});
