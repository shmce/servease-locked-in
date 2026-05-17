import { createApicenterClient } from '@servease/common';
import { InvalidPaymentRequestError } from './payment.errors';
import { SharedPaymentService } from './shared-payment.service';
import { SupabasePaymentRepository } from './supabase-payment.repository';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('SharedPaymentService', () => {
  beforeEach(() => {
    mockCreateApicenterClient.mockReset();
  });

  it('creates checkout sessions through APICenter payment', async () => {
    const paymentCreateCheckoutSession = jest.fn().mockResolvedValue({
      checkoutId: 'checkout-1',
      provider: 'paymongo',
      status: 'created',
      referenceId: 'booking-1',
      redirectUrl: 'https://pay.test/checkout-1',
      providerMode: 'test',
      paymentMethodsAllowed: ['gcash'],
    });
    mockCreateApicenterClient.mockReturnValue({ paymentCreateCheckoutSession });
    const paymentRepository = {
      recordApicenterCheckout: jest.fn().mockResolvedValue({
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        localPaymentStatus: 'pending',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new SharedPaymentService(paymentRepository);

    const session = await service.createCheckoutSession({
      referenceId: ' booking-1 ',
      idempotencyKey: ' idem-1 ',
      successUrl: 'https://servease.test/pay/success',
      cancelUrl: 'https://servease.test/pay/cancel',
      paymentMethods: ['gcash'],
      lineItems: [
        {
          name: ' Home cleaning ',
          quantity: 1,
          amount: { value: 150000, currency: 'PHP' },
        },
      ],
      metadata: { bookingId: 'booking-1' },
      localPayment: {
        bookingId: 'booking-1',
        customerId: 'customer-1',
        providerId: 'provider-1',
        amount: 1200,
        paymentMethod: 'gcash',
      },
    });

    expect(paymentCreateCheckoutSession).toHaveBeenCalledWith({
      referenceId: 'booking-1',
      idempotencyKey: 'idem-1',
      mode: 'payment',
      successUrl: 'https://servease.test/pay/success',
      cancelUrl: 'https://servease.test/pay/cancel',
      lineItems: [
        {
          name: 'Home cleaning',
          quantity: 1,
          amount: { value: 150000, currency: 'PHP' },
        },
      ],
      customerId: undefined,
      priceId: undefined,
      paymentMethods: ['gcash'],
      customer: undefined,
      metadata: { bookingId: 'booking-1' },
    });
    expect(paymentRepository.recordApicenterCheckout).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      amount: 1200,
      paymentMethod: 'gcash',
      session: expect.objectContaining({
        checkoutId: 'checkout-1',
        status: 'created',
        referenceId: 'booking-1',
      }),
    });
    expect(session.checkoutId).toBe('checkout-1');
    expect(session.paymentId).toBe('payment-1');
    expect(session.localPaymentStatus).toBe('pending');
  });

  it('syncs APICenter checkout status into the local payment record', async () => {
    const paymentGetCheckoutStatus = jest.fn().mockResolvedValue({
      checkoutId: 'checkout-1',
      provider: 'paymongo',
      status: 'paid',
      referenceId: 'booking-1',
      redirectUrl: 'https://pay.test/checkout-1',
      providerMode: 'test',
    });
    mockCreateApicenterClient.mockReturnValue({ paymentGetCheckoutStatus });
    const paymentRepository = {
      syncApicenterCheckoutStatus: jest.fn().mockResolvedValue({
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        localPaymentStatus: 'paid',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new SharedPaymentService(paymentRepository);

    const session = await service.getCheckoutStatus(' checkout-1 ');

    expect(paymentGetCheckoutStatus).toHaveBeenCalledWith('checkout-1');
    expect(paymentRepository.syncApicenterCheckoutStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        checkoutId: 'checkout-1',
        status: 'paid',
      }),
    );
    expect(session.paymentId).toBe('payment-1');
    expect(session.localPaymentStatus).toBe('paid');
  });

  it('reconciles APICenter checkout webhook payloads without polling APICenter', async () => {
    const paymentRepository = {
      syncApicenterCheckoutStatus: jest.fn().mockResolvedValue({
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        localPaymentStatus: 'paid',
        paidAt: '2026-05-18T10:00:00.000Z',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new SharedPaymentService(paymentRepository);

    const session = await service.syncCheckoutWebhook({
      checkoutId: ' checkout-1 ',
      status: 'paid',
      referenceId: ' booking-1 ',
      provider: 'paymongo',
      providerMode: 'test',
      redirectUrl: 'https://pay.test/checkout-1',
      paymentMethodsAllowed: ['gcash'],
      metadata: { bookingId: 'booking-1' },
    });

    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
    expect(paymentRepository.syncApicenterCheckoutStatus).toHaveBeenCalledWith({
      checkoutId: 'checkout-1',
      provider: 'paymongo',
      providerMode: 'test',
      status: 'paid',
      referenceId: 'booking-1',
      redirectUrl: 'https://pay.test/checkout-1',
      expiresAt: undefined,
      amount: undefined,
      currency: undefined,
      paymentMethodsAllowed: ['gcash'],
      metadata: { bookingId: 'booking-1' },
    });
    expect(session.localPaymentStatus).toBe('paid');
  });

  it('rejects invalid checkout sessions before APICenter calls', async () => {
    const service = new SharedPaymentService();

    await expect(
      service.createCheckoutSession({
        referenceId: '',
        successUrl: 'not-a-url',
        cancelUrl: 'https://servease.test/cancel',
        lineItems: [],
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(mockCreateApicenterClient).not.toHaveBeenCalled();
  });

  it('creates refunds through APICenter payment', async () => {
    const paymentCreateRefund = jest.fn().mockResolvedValue({
      refundId: 'refund-1',
      paymentId: 'payment-1',
      provider: 'paymongo',
      status: 'pending',
      amount: { value: 50000, currency: 'PHP' },
    });
    mockCreateApicenterClient.mockReturnValue({ paymentCreateRefund });
    const service = new SharedPaymentService();

    await service.createRefund({
      paymentId: ' payment-1 ',
      amount: { value: 50000, currency: 'php' },
      idempotencyKey: ' refund-idem ',
      reason: ' customer_request ',
    });

    expect(paymentCreateRefund).toHaveBeenCalledWith('payment-1', {
      amount: { value: 50000, currency: 'PHP' },
      idempotencyKey: 'refund-idem',
      reason: 'customer_request',
      referenceId: undefined,
      metadata: undefined,
    });
  });
});
