import { InvalidSupportTicketRequestError } from './ticket.errors';
import { SupportTicketAdminService } from './ticket-admin.service';
import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

describe('SupportTicketAdminService', () => {
  it('rejects invalid status updates before repository writes', async () => {
    const repository = {
      updateTicketStatus: jest.fn(),
    } as unknown as SupabaseSupportTicketRepository;
    const service = new SupportTicketAdminService(repository);

    await expect(
      service.updateTicketStatus('ticket-1', 'invalid'),
    ).rejects.toBeInstanceOf(InvalidSupportTicketRequestError);
    expect(repository.updateTicketStatus).not.toHaveBeenCalled();
  });
});
