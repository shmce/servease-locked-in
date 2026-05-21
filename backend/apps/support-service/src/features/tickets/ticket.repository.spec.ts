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
      p_attachments: [],
    });
    expect(ticket.status).toBe('open');
  });

  it('gets user-scoped support tickets through the service RPC', async () => {
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

    const ticket = await repository.getTicket('user-1', 'ticket-1');

    expect(rpc).toHaveBeenCalledWith('servease_get_support_ticket', {
      p_user_id: 'user-1',
      p_ticket_id: 'ticket-1',
    });
    expect(ticket.id).toBe('ticket-1');
  });

  it('lists ticket replies through the reply RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'reply-1',
          ticket_id: 'ticket-1',
          replied_by: 'user-1',
          message: 'Following up',
          created_at: '2026-05-15T11:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const replies = await repository.listReplies('ticket-1');

    expect(rpc).toHaveBeenCalledWith('servease_admin_list_ticket_replies', {
      p_ticket_id: 'ticket-1',
    });
    expect(replies[0]?.message).toBe('Following up');
  });

  it('adds ticket replies through the reply RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'reply-1',
        ticket_id: 'ticket-1',
        replied_by: 'user-1',
        message: 'Following up',
        created_at: '2026-05-15T11:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabaseSupportTicketRepository({ rpc });

    const reply = await repository.addReply(
      'ticket-1',
      'user-1',
      'Following up',
    );

    expect(rpc).toHaveBeenCalledWith('servease_admin_add_ticket_reply', {
      p_ticket_id: 'ticket-1',
      p_replied_by: 'user-1',
      p_message: 'Following up',
    });
    expect(reply.id).toBe('reply-1');
  });
});
