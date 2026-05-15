import { MessagingController } from './messaging.controller';
import { MessagingGatewayService } from './messaging.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { BookingGatewayService } from '../booking/booking.service';

describe('MessagingController', () => {
  it('creates a conversation only after booking visibility is confirmed', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('customer-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as CatalogServiceClient;
    const bookingGatewayService = {
      findBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
      }),
    } as unknown as BookingGatewayService;
    const messagingGatewayService = {
      getOrCreateConversation: jest.fn().mockResolvedValue({
        id: 'conversation-1',
      }),
    } as unknown as MessagingGatewayService;
    const controller = new MessagingController(
      messagingGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.open('Bearer token', {
      bookingId: 'booking-1',
    });

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(messagingGatewayService.getOrCreateConversation).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
    });
    expect(response.data.id).toBe('conversation-1');
  });
});
