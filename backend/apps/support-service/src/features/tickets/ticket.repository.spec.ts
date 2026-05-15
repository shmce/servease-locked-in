import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

describe('SupabaseSupportTicketRepository', () => {
  it('creates support tickets through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'ticket-1',
        user_id: 'user-1',
        subject: 'Need help',
        message: 'Details',
        category: 'booking',
        status: 'open',
        created_at: '2026-05-15T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const ticket = await repository.createTicket({
      userId: 'user-1',
      subject: 'Need help',
      message: 'Details',
      category: 'booking',
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_support_ticket', {
      p_user_id: 'user-1',
      p_subject: 'Need help',
      p_message: 'Details',
      p_category: 'booking',
    });
    expect(ticket.status).toBe('open');
  });
});
