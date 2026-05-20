import { BookingGatewayService } from '../booking/booking.service';
import { AuthTokenService } from '../current-user/auth-token.service';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { ConfigService } from '@nestjs/config';
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

  it('keeps payment creation successful when provider notification dispatch fails', async () => {
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
      createNotification: jest.fn().mockRejectedValue(new Error('notification down')),
    } as unknown as NotificationServiceClient;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
      notificationServiceClient,
    );

    await expect(
      controller.create('Bearer token', {
        bookingId: 'booking-1',
        paymentMethod: 'cash_on_service',
      }),
    ).resolves.toMatchObject({
      data: {
        id: 'payment-1',
        bookingId: 'booking-1',
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

  it('creates APICenter checkout sessions only after booking ownership is confirmed', async () => {
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
        serviceTitle: 'Home cleaning',
        totalAmount: 1200,
      }),
    } as unknown as BookingGatewayService;
    const paymentGatewayService = {
      createCheckoutSession: jest.fn().mockResolvedValue({
        checkoutId: 'checkout-1',
        provider: 'paymongo',
        status: 'created',
        referenceId: 'booking-1',
        redirectUrl: 'https://pay.test/checkout-1',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.createCheckoutSession(
      'Bearer token',
      'idem-1',
      {
        bookingId: 'booking-1',
        successUrl: 'https://servease.test/pay/success',
        cancelUrl: 'https://servease.test/pay/cancel',
        paymentMethods: ['gcash'],
      },
    );

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(paymentGatewayService.createCheckoutSession).toHaveBeenCalledWith(
      {
        referenceId: 'booking-1',
        mode: 'payment',
        successUrl: 'https://servease.test/pay/success',
        cancelUrl: 'https://servease.test/pay/cancel',
        paymentMethods: ['gcash'],
        lineItems: [
          {
            name: 'Home cleaning',
            quantity: 1,
            amount: {
              value: 120000,
              currency: 'PHP',
            },
          },
        ],
        metadata: {
          bookingId: 'booking-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          promoCode: '',
        },
        localPayment: {
          bookingId: 'booking-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          amount: 1200,
          paymentMethod: 'gcash',
        },
      },
      'idem-1',
    );
    expect(response.data.checkoutId).toBe('checkout-1');
  });

  it('rejects checkout creation when the authenticated user is not the customer', async () => {
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
      createCheckoutSession: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    await expect(
      controller.createCheckoutSession('Bearer token', undefined, {
        bookingId: 'booking-1',
        successUrl: 'https://servease.test/pay/success',
        cancelUrl: 'https://servease.test/pay/cancel',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(paymentGatewayService.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('rejects checkout creation with non-APICenter payment methods', async () => {
    const authTokenService = {
      authenticate: jest.fn(),
    } as unknown as AuthTokenService;
    const paymentGatewayService = {
      createCheckoutSession: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      {} as unknown as BookingGatewayService,
      authTokenService,
      {} as unknown as CatalogServiceClient,
    );

    await expect(
      controller.createCheckoutSession('Bearer token', undefined, {
        bookingId: 'booking-1',
        successUrl: 'https://servease.test/pay/success',
        cancelUrl: 'https://servease.test/pay/cancel',
        paymentMethods: ['cash_on_service' as never],
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(authTokenService.authenticate).not.toHaveBeenCalled();
    expect(paymentGatewayService.createCheckoutSession).not.toHaveBeenCalled();
  });

  it('loads APICenter checkout status only after returned booking visibility is confirmed', async () => {
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
      getCheckoutStatus: jest.fn().mockResolvedValue({
        checkoutId: 'checkout-1',
        provider: 'paymongo',
        status: 'paid',
        referenceId: 'booking-1',
        redirectUrl: 'https://pay.test/checkout-1',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      bookingGatewayService,
      authTokenService,
      catalogServiceClient,
    );

    const response = await controller.checkoutStatus(
      'Bearer token',
      'checkout-1',
    );

    expect(bookingGatewayService.findBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(response.data.status).toBe('paid');
  });

  it('accepts APICenter payment webhooks only when the shared secret matches', async () => {
    const paymentGatewayService = {
      syncApicenterCheckoutWebhook: jest.fn().mockResolvedValue({
        checkoutId: 'checkout-1',
        provider: 'paymongo',
        status: 'paid',
        referenceId: 'booking-1',
        redirectUrl: 'https://pay.test/checkout-1',
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        localPaymentStatus: 'paid',
      }),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      {} as unknown as BookingGatewayService,
      {} as unknown as AuthTokenService,
      {} as unknown as CatalogServiceClient,
      undefined,
      { get: jest.fn().mockReturnValue('webhook-secret') } as unknown as ConfigService,
    );

    const response = await controller.apicenterWebhook(
      'webhook-secret',
      undefined,
      String(Date.now()),
      {
        checkoutId: 'checkout-1',
        provider: 'paymongo',
        status: 'paid',
        referenceId: 'booking-1',
        redirectUrl: 'https://pay.test/checkout-1',
      },
    );

    expect(paymentGatewayService.syncApicenterCheckoutWebhook).toHaveBeenCalledWith({
      checkoutId: 'checkout-1',
      provider: 'paymongo',
      status: 'paid',
      referenceId: 'booking-1',
      redirectUrl: 'https://pay.test/checkout-1',
    });
    expect(response.data.localPaymentStatus).toBe('paid');

    await expect(
      controller.apicenterWebhook(
        'wrong-secret',
        undefined,
        String(Date.now()),
        {
          checkoutId: 'checkout-1',
          provider: 'paymongo',
          status: 'paid',
          referenceId: 'booking-1',
          redirectUrl: 'https://pay.test/checkout-1',
        },
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_auth_token',
        },
      },
    });
  });

  it('rejects stale APICenter payment webhook timestamps before forwarding', async () => {
    const paymentGatewayService = {
      syncApicenterCheckoutWebhook: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      {} as unknown as BookingGatewayService,
      {} as unknown as AuthTokenService,
      {} as unknown as CatalogServiceClient,
      undefined,
      { get: jest.fn().mockReturnValue('webhook-secret') } as unknown as ConfigService,
    );

    await expect(
      controller.apicenterWebhook(
        'webhook-secret',
        undefined,
        String(Date.now() - 10 * 60 * 1000),
        {
          checkoutId: 'checkout-1',
          provider: 'paymongo',
          status: 'paid',
          referenceId: 'booking-1',
          redirectUrl: 'https://pay.test/checkout-1',
        },
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(paymentGatewayService.syncApicenterCheckoutWebhook).not.toHaveBeenCalled();
  });

  it('rejects invalid APICenter payment webhook payloads before forwarding', async () => {
    const paymentGatewayService = {
      syncApicenterCheckoutWebhook: jest.fn(),
    } as unknown as PaymentGatewayService;
    const controller = new PaymentController(
      paymentGatewayService,
      {} as unknown as BookingGatewayService,
      {} as unknown as AuthTokenService,
      {} as unknown as CatalogServiceClient,
      undefined,
      { get: jest.fn().mockReturnValue('webhook-secret') } as unknown as ConfigService,
    );

    await expect(
      controller.apicenterWebhook(
        'webhook-secret',
        undefined,
        String(Date.now()),
        {
          checkoutId: 'checkout-1',
          provider: 'paymongo',
          status: 'settled' as never,
          referenceId: 'booking-1',
          redirectUrl: 'https://pay.test/checkout-1',
        },
      ),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'invalid_payment_request',
        },
      },
    });
    expect(paymentGatewayService.syncApicenterCheckoutWebhook).not.toHaveBeenCalled();
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
