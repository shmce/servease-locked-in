import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
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

  it('rejects payment creation when the authenticated user is only the provider', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('provider-user-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue({
        id: 'provider-1',
      }),
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
      createPayment: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    await expect(
      controller.create('Bearer token', {
        bookingId: 'booking-1',
        paymentMethod: 'cash_on_service',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(paymentGatewayService.createPayment).not.toHaveBeenCalled();
  });

  it('notifies the provider owner when a customer reserves payment', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('customer-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue(null),
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
        businessName: 'Provider Co.',
      }),
    } as unknown as CatalogServiceClient;
    const bookingGatewayService = {
      findBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        serviceTitle: 'Home cleaning',
        totalAmount: 1200,
      }),
    } as unknown as BookingGatewayService;
    const paymentGatewayService = {
      createPayment: jest.fn().mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        amount: 1200,
        status: 'paid',
      }),
    } as unknown as PaymentGatewayService;
    const notificationServiceClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    } as unknown as NotificationServiceClient;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
      notificationServiceClient,
    );

    await controller.create('Bearer token', {
      bookingId: 'booking-1',
      paymentMethod: 'cash_on_service',
    });

    expect(catalogServiceClient.findProviderOwnerByProviderId).toHaveBeenCalledWith(
      'provider-1',
    );
    expect(notificationServiceClient.createNotification).toHaveBeenCalledWith({
      userId: 'provider-user-1',
      type: 'payment_reserved',
      title: 'Payment reserved',
      body: 'A customer reserved payment for Home cleaning.',
      metadata: {
        bookingId: 'booking-1',
        paymentId: 'payment-1',
        status: 'paid',
      },
    });
  });

  it('revalidates promo codes against the visible booking before payment creation', async () => {
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
      validatePromotion: jest.fn().mockResolvedValue({
        code: 'SERVEASE10',
        valid: true,
        discountAmount: 120,
        finalAmount: 1080,
        message: 'Promo applied.',
      }),
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

    await controller.create('Bearer token', {
      bookingId: 'booking-1',
      paymentMethod: 'cash_on_service',
      promoCode: 'SERVEASE10',
    });

    expect(paymentGatewayService.validatePromotion).toHaveBeenCalledWith(
      'SERVEASE10',
      1200,
    );
    expect(paymentGatewayService.createPayment).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      amount: 1080,
      paymentMethod: 'cash_on_service',
    });
  });

  it('validates a promo code only after booking visibility is confirmed', async () => {
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
      validatePromotion: jest.fn().mockResolvedValue({
        code: 'SERVEASE10',
        valid: true,
        discountAmount: 120,
        finalAmount: 1080,
        message: 'Promo applied.',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.validatePromotion('Bearer token', {
      bookingId: 'booking-1',
      code: 'SERVEASE10',
    });

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(paymentGatewayService.validatePromotion).toHaveBeenCalledWith(
      'SERVEASE10',
      1200,
    );
    expect(response.data.finalAmount).toBe(1080);
  });

  it('rejects promo validation when the authenticated user is only the provider', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('provider-user-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue({
        id: 'provider-1',
      }),
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
      validatePromotion: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    await expect(
      controller.validatePromotion('Bearer token', {
        bookingId: 'booking-1',
        code: 'SERVEASE10',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(paymentGatewayService.validatePromotion).not.toHaveBeenCalled();
  });

  it('routes payout account requests through the authenticated provider profile', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('provider-user-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn().mockResolvedValue({
        id: 'provider-1',
      }),
    } as unknown as CatalogServiceClient;
    const bookingGatewayService = {} as unknown as BookingGatewayService;
    const paymentGatewayService = {
      getPayoutAccount: jest.fn().mockResolvedValue({
        availableBalance: 100,
        pendingBalance: 25,
        totalPaidOut: 300,
        nextPayoutDate: null,
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.payoutAccount('Bearer token');

    expect(paymentGatewayService.getPayoutAccount).toHaveBeenCalledWith(
      'provider-1',
    );
    expect(response.data.availableBalance).toBe(100);
  });

  it('routes customer payment methods through the authenticated user id', async () => {
    const authTokenService = {
      authenticate: jest.fn().mockResolvedValue('customer-1'),
    } as unknown as AuthTokenService;
    const catalogServiceClient = {
      findProviderProfileByUserId: jest.fn(),
    } as unknown as CatalogServiceClient;
    const bookingGatewayService = {} as unknown as BookingGatewayService;
    const paymentGatewayService = {
      listCustomerPaymentMethods: jest.fn().mockResolvedValue([
        {
          id: 'method-1',
          customerId: 'customer-1',
          methodType: 'cash_on_service',
          label: 'Cash on service',
        },
      ]),
      upsertCustomerPaymentMethod: jest.fn().mockResolvedValue({
        id: 'method-2',
      }),
      deleteCustomerPaymentMethod: jest.fn().mockResolvedValue({
        id: 'method-2',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const listed = await controller.customerPaymentMethods('Bearer token');
    const saved = await controller.upsertCustomerPaymentMethod('Bearer token', {
      methodType: 'gcash',
      label: 'GCash wallet',
      brand: 'GCash',
      isDefault: true,
    });
    const deleted = await controller.deleteCustomerPaymentMethod(
      'Bearer token',
      'method-2',
    );

    expect(paymentGatewayService.listCustomerPaymentMethods).toHaveBeenCalledWith(
      'customer-1',
    );
    expect(paymentGatewayService.upsertCustomerPaymentMethod).toHaveBeenCalledWith(
      'customer-1',
      {
        methodType: 'gcash',
        label: 'GCash wallet',
        brand: 'GCash',
        isDefault: true,
      },
    );
    expect(paymentGatewayService.deleteCustomerPaymentMethod).toHaveBeenCalledWith(
      'customer-1',
      'method-2',
    );
    expect(listed.data[0]?.id).toBe('method-1');
    expect(saved.data.id).toBe('method-2');
    expect(deleted.data.id).toBe('method-2');
  });
});
