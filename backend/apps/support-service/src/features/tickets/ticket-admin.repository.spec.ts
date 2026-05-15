import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

describe('SupabaseSupportTicketRepository admin operations', () => {
  it('updates support ticket status through the admin service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'ticket-1',
        user_id: 'user-1',
        subject: 'Need help',
        message: 'Details',
        category: 'booking',
        status: 'resolved',
        created_at: '2026-05-15T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const ticket = await repository.updateTicketStatus('ticket-1', 'resolved');

    expect(rpc).toHaveBeenCalledWith('servease_admin_update_support_ticket_status', {
      p_ticket_id: 'ticket-1',
      p_status: 'resolved',
    });
    expect(ticket.status).toBe('resolved');
  });
});
