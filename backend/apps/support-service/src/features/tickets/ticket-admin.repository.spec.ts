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

  it('gets support tickets through the admin detail RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'ticket-1',
        user_id: 'user-1',
        subject: 'Need help',
        message: 'Details',
        category: 'booking',
        status: 'open',
        assignee_id: null,
        created_at: '2026-05-15T10:00:00.000Z',
        attachments: [],
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const ticket = await repository.adminGetTicket('ticket-1');

    expect(rpc).toHaveBeenCalledWith('servease_admin_get_support_ticket', {
      p_ticket_id: 'ticket-1',
    });
    expect(ticket.id).toBe('ticket-1');
  });

  it('assigns support tickets through the admin assignment RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'ticket-1',
        user_id: 'user-1',
        subject: 'Need help',
        message: 'Details',
        category: 'booking',
        status: 'open',
        assignee_id: 'admin-1',
        created_at: '2026-05-15T10:00:00.000Z',
        attachments: [],
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const ticket = await repository.assignTicket('ticket-1', 'admin-1');

    expect(rpc).toHaveBeenCalledWith('servease_admin_assign_ticket', {
      p_ticket_id: 'ticket-1',
      p_assignee_id: 'admin-1',
    });
    expect(ticket.assigneeId).toBe('admin-1');
  });
});
