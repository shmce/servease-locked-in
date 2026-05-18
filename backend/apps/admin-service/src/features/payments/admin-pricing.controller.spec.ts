import { PaymentServiceRequestError } from './clients/payment-service.client';
import { AdminPricingController } from './admin-pricing.controller';
import { AdminPricingService } from './admin-pricing.service';

describe('AdminPricingController', () => {
  it('does not flatten structured pricing-service errors into generic workflow failures', async () => {
    const controller = new AdminPricingController({
      listRules: jest.fn().mockRejectedValue(
        new PaymentServiceRequestError(
          503,
          'pricing_dependency_unavailable',
          'Pricing service is unavailable.',
        ),
      ),
    } as unknown as AdminPricingService);

    await expect(controller.listRules()).rejects.toMatchObject({
      response: {
        error: {
          code: 'pricing_dependency_unavailable',
          message: 'Pricing service is unavailable.',
        },
      },
      status: 503,
    });
  });
});
