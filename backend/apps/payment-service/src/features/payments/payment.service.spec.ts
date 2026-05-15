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
});
