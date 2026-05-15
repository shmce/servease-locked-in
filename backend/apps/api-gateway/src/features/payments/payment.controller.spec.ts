import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { PaymentController } from './payment.controller';
import { PaymentGatewayService } from './payment.service';

describe('PaymentController', () => {
  it('creates payment only after booking visibility is confirmed', async () => {
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
        totalAmount: 1200,
      }),
    } as unknown as BookingGatewayService;
    const paymentGatewayService = {
      createPayment: jest.fn().mockResolvedValue({
        id: 'payment-1',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.create('Bearer token', {
      bookingId: 'booking-1',
      paymentMethod: 'cash_on_service',
    });

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(paymentGatewayService.createPayment).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      amount: 1200,
      paymentMethod: 'cash_on_service',
    });
    expect(response.data.id).toBe('payment-1');
  });
});
