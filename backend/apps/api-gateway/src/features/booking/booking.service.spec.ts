import { BookingGatewayService } from './booking.service';
import { BookingServiceClient } from './clients/booking-service.client';

describe('BookingGatewayService', () => {
  it('forwards booking creation with the authenticated user id', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue({
        id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        status: 'pending',
      }),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client);

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T08:00:00.000Z',
    });

    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
      },
    );
  });

  it('forwards booking list visibility ids', async () => {
    const client = {
      listBookings: jest.fn().mockResolvedValue([]),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client);

    await service.listBookings(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );

    expect(client.listBookings).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
  });
});
