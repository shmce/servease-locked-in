import { AdminPaymentService } from './admin-payment.service';
import { PaymentServiceClient } from './clients/payment-service.client';

describe('AdminPaymentService', () => {
  it('forwards payment status updates to Payment Service', async () => {
    const client = {
      updatePaymentStatus: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'paid',
      }),
    } as unknown as PaymentServiceClient;
    const service = new AdminPaymentService(client);

    const payment = await service.updatePaymentStatus('payment-1', 'paid');

    expect(client.updatePaymentStatus).toHaveBeenCalledWith('payment-1', 'paid');
    expect(payment.status).toBe('paid');
  });
});
