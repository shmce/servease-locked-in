import { AuthTokenService } from '../current-user/auth-token.service';
import { SupportController } from './support.controller';
import { SupportGatewayService } from './support.service';

describe('SupportController', () => {
  it('creates tickets for the authenticated user', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('user-1'),
    } as unknown as AuthTokenService;
    const supportGatewayService = {
      createTicket: jest.fn().mockResolvedValue({
        id: 'ticket-1',
      }),
    } as unknown as SupportGatewayService;
    const controller = new SupportController(
      supportGatewayService,
      authTokenService,
    );

    const response = await controller.create('Bearer token', {
      subject: 'Need help',
      message: 'Details',
      category: 'booking',
      attachments: [],
    });

    expect(supportGatewayService.createTicket).toHaveBeenCalledWith({
      userId: 'user-1',
      subject: 'Need help',
      message: 'Details',
      category: 'booking',
      attachments: [],
    });
    expect(response.data.id).toBe('ticket-1');
  });
});
