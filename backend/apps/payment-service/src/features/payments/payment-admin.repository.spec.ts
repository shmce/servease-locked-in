import { SupabasePaymentRepository } from './supabase-payment.repository';

describe('SupabasePaymentRepository admin operations', () => {
  it('updates payment status through the admin service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'payment-1',
        booking_id: 'booking-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        amount: 1000,
        platform_fee: 150,
        provider_payout: 850,
        status: 'paid',
        payment_method: 'cash_on_service',
        paid_at: '2026-05-15T10:00:00.000Z',
        created_at: '2026-05-15T09:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const payment = await repository.updatePaymentStatus('payment-1', 'paid');

    expect(rpc).toHaveBeenCalledWith('servease_admin_update_payment_status', {
      p_payment_id: 'payment-1',
      p_status: 'paid',
    });
    expect(payment.status).toBe('paid');
  });
});
