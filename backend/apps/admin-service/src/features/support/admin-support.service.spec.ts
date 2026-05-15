import { AdminSupportService } from './admin-support.service';
import { SupportServiceClient } from './clients/support-service.client';

describe('AdminSupportService', () => {
  it('forwards support ticket status updates to Support Service', async () => {
    const client = {
      updateTicketStatus: jest.fn().mockResolvedValue({
        id: 'ticket-1',
        status: 'resolved',
      }),
    } as unknown as SupportServiceClient;
    const service = new AdminSupportService(client);

    const ticket = await service.updateTicketStatus('ticket-1', 'resolved');

    expect(client.updateTicketStatus).toHaveBeenCalledWith(
      'ticket-1',
      'resolved',
    );
    expect(ticket.status).toBe('resolved');
  });
});
