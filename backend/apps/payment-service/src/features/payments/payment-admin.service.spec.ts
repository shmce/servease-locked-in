import { InvalidPaymentRequestError } from './payment.errors';
import { PaymentAdminService } from './payment-admin.service';
import { SupabasePaymentRepository } from './supabase-payment.repository';

describe('PaymentAdminService', () => {
  it('rejects invalid payment status updates before repository writes', async () => {
    const repository = {
      updatePaymentStatus: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await expect(
      service.updatePaymentStatus('payment-1', 'invalid'),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.updatePaymentStatus).not.toHaveBeenCalled();
  });
});
