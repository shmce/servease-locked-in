import { AdminDisputeService } from './admin-dispute.service';
import { BookingServiceClient } from './clients/booking-service.client';

describe('AdminDisputeService', () => {
  it('forwards dispute list requests to Booking Service', async () => {
    const client = {
      listDisputes: jest.fn().mockResolvedValue([
        {
          id: 'dispute-1',
          status: 'open',
        },
      ]),
    } as unknown as BookingServiceClient;
    const service = new AdminDisputeService(client);

    const disputes = await service.listDisputes('open');

    expect(client.listDisputes).toHaveBeenCalledWith('open');
    expect(disputes[0].status).toBe('open');
  });

  it('forwards dispute resolve requests to Booking Service', async () => {
    const client = {
      resolveDispute: jest.fn().mockResolvedValue({
        id: 'dispute-1',
        status: 'resolved',
      }),
    } as unknown as BookingServiceClient;
    const service = new AdminDisputeService(client);

    const dispute = await service.resolveDispute('dispute-1');

    expect(client.resolveDispute).toHaveBeenCalledWith('dispute-1');
    expect(dispute.status).toBe('resolved');
  });
});
