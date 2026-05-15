import { SupabasePaymentRepository } from './supabase-payment.repository';

describe('SupabasePaymentRepository', () => {
  it('creates or returns a booking payment through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'payment-1',
        booking_id: 'booking-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        amount: 1000,
        platform_fee: 150,
        provider_payout: 850,
        status: 'pending',
        payment_method: 'cash_on_service',
        paid_at: null,
        created_at: '2026-05-15T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const payment = await repository.createPayment({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      amount: 1000,
      paymentMethod: 'cash_on_service',
    });

    expect(rpc).toHaveBeenCalledWith('servease_create_payment', {
      p_booking_id: 'booking-1',
      p_customer_id: 'customer-1',
      p_provider_id: 'provider-1',
      p_amount: 1000,
      p_payment_method: 'cash_on_service',
    });
    expect(payment.providerPayout).toBe(850);
  });
});
