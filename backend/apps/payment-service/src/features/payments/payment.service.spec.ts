import { InvalidPaymentRequestError } from './payment.errors';
import { PaymentService } from './payment.service';
import { SupabasePaymentRepository } from './supabase-payment.repository';

describe('PaymentService', () => {
  it('rejects invalid payment creation before repository writes', async () => {
    const repository = {
      createPayment: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    await expect(
      service.createPayment({
        bookingId: '',
        customerId: 'customer-1',
        providerId: 'provider-1',
        amount: 0,
        paymentMethod: '',
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.createPayment).not.toHaveBeenCalled();
  });

  it('normalizes promotion codes before repository validation', async () => {
    const repository = {
      validatePromotion: jest.fn().mockResolvedValue({
        code: 'SERVEASE10',
        valid: true,
        discountAmount: 120,
        finalAmount: 1080,
        message: 'Promo applied.',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    const promotion = await service.validatePromotion(' servease10 ', 1200);

    expect(repository.validatePromotion).toHaveBeenCalledWith('SERVEASE10', 1200);
    expect(promotion.finalAmount).toBe(1080);
  });

  it('confirms cash-on-service payments by booking id', async () => {
    const repository = {
      confirmCashOnServicePayment: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'paid',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    const payment = await service.confirmCashOnServicePayment({
      bookingId: ' booking-1 ',
      providerId: ' provider-1 ',
    });

    expect(repository.confirmCashOnServicePayment).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      providerId: 'provider-1',
    });
    expect(payment.status).toBe('paid');
  });

  it('rejects cash confirmation without a booking id', async () => {
    const repository = {
      confirmCashOnServicePayment: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    await expect(
      service.confirmCashOnServicePayment({ bookingId: ' ' }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.confirmCashOnServicePayment).not.toHaveBeenCalled();
  });

  it('rejects invalid promotion validation before repository reads', async () => {
    const repository = {
      validatePromotion: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    await expect(service.validatePromotion('', 1200)).rejects.toBeInstanceOf(
      InvalidPaymentRequestError,
    );
    await expect(service.validatePromotion('SERVEASE10', 0)).rejects.toBeInstanceOf(
      InvalidPaymentRequestError,
    );
    expect(repository.validatePromotion).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'missing provider id',
      input: {
        providerId: '',
        userId: 'user-1',
        amount: 100,
        payoutMethodId: 'method-1',
      },
    },
    {
      name: 'missing payout method id',
      input: {
        providerId: 'provider-1',
        userId: 'user-1',
        amount: 100,
        payoutMethodId: '',
      },
    },
    {
      name: 'non-positive amount',
      input: {
        providerId: 'provider-1',
        userId: 'user-1',
        amount: 0,
        payoutMethodId: 'method-1',
      },
    },
  ])('rejects payout requests with $name', async ({ input }) => {
    const repository = {
      createPayoutRequest: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    expect(() => service.createPayoutRequest(input)).toThrow(
      InvalidPaymentRequestError,
    );
    expect(repository.createPayoutRequest).not.toHaveBeenCalled();
  });

  it('normalizes payout method account fields before repository writes', async () => {
    const repository = {
      upsertPayoutMethod: jest.fn().mockResolvedValue({
        id: 'method-1',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    await service.upsertPayoutMethod({
      providerId: 'provider-1',
      methodType: 'gcash',
      accountLabel: '  GCash **** 1234  ',
      accountName: '  Demo Provider  ',
      accountNumberLast4: ' 1234 ',
      isDefault: true,
    });

    expect(repository.upsertPayoutMethod).toHaveBeenCalledWith({
      providerId: 'provider-1',
      methodType: 'gcash',
      accountLabel: 'GCash **** 1234',
      accountName: 'Demo Provider',
      accountNumberLast4: '1234',
      isDefault: true,
    });
  });

  it('normalizes customer payment method display fields before repository writes', async () => {
    const repository = {
      upsertCustomerPaymentMethod: jest.fn().mockResolvedValue({
        id: 'method-1',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    await service.upsertCustomerPaymentMethod({
      customerId: 'customer-1',
      methodType: 'card',
      label: '  Card ending 4242  ',
      brand: '  Visa  ',
      last4: ' 4242 ',
      isDefault: true,
    });

    expect(repository.upsertCustomerPaymentMethod).toHaveBeenCalledWith({
      customerId: 'customer-1',
      methodType: 'card',
      label: 'Card ending 4242',
      brand: 'Visa',
      last4: '4242',
      isDefault: true,
    });
  });

  it('rejects customer payment methods with sensitive-looking card values', async () => {
    const repository = {
      upsertCustomerPaymentMethod: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentService(repository);

    expect(() =>
      service.upsertCustomerPaymentMethod({
        customerId: 'customer-1',
        methodType: 'card',
        label: 'Card',
        last4: '4242424242424242',
      }),
    ).toThrow(InvalidPaymentRequestError);
    expect(repository.upsertCustomerPaymentMethod).not.toHaveBeenCalled();
  });
});
