import { AdminSupportController } from './admin-support.controller';
import { AdminSupportService } from './admin-support.service';

describe('AdminSupportController', () => {
  it('forwards reply listing to the admin support service', async () => {
    const service = {
      listReplies: jest.fn().mockResolvedValue([
        {
          id: 'reply-1',
          ticketId: 'ticket-1',
          repliedBy: 'admin-1',
          message: 'We are checking.',
          createdAt: '2026-05-21T00:00:00.000Z',
        },
      ]),
    } as unknown as AdminSupportService;
    const controller = new AdminSupportController(service);

    const response = await controller.listReplies('ticket-1');

    expect(service.listReplies).toHaveBeenCalledWith('ticket-1');
    expect(response.data[0]?.id).toBe('reply-1');
  });

  it('forwards reply creation to the admin support service', async () => {
    const service = {
      addReply: jest.fn().mockResolvedValue({
        id: 'reply-1',
        ticketId: 'ticket-1',
        repliedBy: 'admin-1',
        message: 'We are checking.',
        createdAt: '2026-05-21T00:00:00.000Z',
      }),
    } as unknown as AdminSupportService;
    const controller = new AdminSupportController(service);

    const response = await controller.addReply('ticket-1', {
      repliedBy: 'admin-1',
      message: 'We are checking.',
    });

    expect(service.addReply).toHaveBeenCalledWith(
      'ticket-1',
      'admin-1',
      'We are checking.',
    );
    expect(response.data.message).toBe('We are checking.');
  });

  it('forwards assignment to the admin support service', async () => {
    const service = {
      assignTicket: jest.fn().mockResolvedValue({
        id: 'ticket-1',
        assigneeId: 'admin-1',
      }),
    } as unknown as AdminSupportService;
    const controller = new AdminSupportController(service);

    const response = await controller.assignTicket('ticket-1', {
      assigneeId: 'admin-1',
    });

    expect(service.assignTicket).toHaveBeenCalledWith('ticket-1', 'admin-1');
    expect(response.data.assigneeId).toBe('admin-1');
  });
});
