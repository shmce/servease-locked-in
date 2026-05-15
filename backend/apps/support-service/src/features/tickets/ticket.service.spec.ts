import { InvalidSupportTicketRequestError } from './ticket.errors';
import { SupportTicketService } from './ticket.service';
import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

describe('SupportTicketService', () => {
  it('rejects empty ticket subjects before repository writes', async () => {
    const repository = {
      createTicket: jest.fn(),
    } as unknown as SupabaseSupportTicketRepository;
    const service = new SupportTicketService(repository);

    await expect(
      service.createTicket({
        userId: 'user-1',
        subject: ' ',
        message: 'Help',
        category: 'booking',
      }),
    ).rejects.toBeInstanceOf(InvalidSupportTicketRequestError);
    expect(repository.createTicket).not.toHaveBeenCalled();
  });
});
