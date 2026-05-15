import { HttpException } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityGatewayService } from './availability.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';

describe('AvailabilityController', () => {
  it('exposes public provider availability by provider id', async () => {
    const availabilityGatewayService = {
      getSchedule: jest.fn().mockResolvedValue({
        providerId: 'f87b3f7e-6b54-4cef-852f-854983780c7b',
        windows: [],
        daysOff: [],
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
});
