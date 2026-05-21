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

  it('normalizes promotion inputs before repository writes', async () => {
    const repository = {
      upsertPromotion: jest.fn().mockResolvedValue({
        id: 'promo-1',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await service.upsertPromotion({
      code: ' servease10 ',
      description: ' Demo discount ',
      discountType: 'percent',
      discountValue: 10,
      maxDiscountAmount: 300,
      minOrderAmount: 500,
      isActive: true,
    });

    expect(repository.upsertPromotion).toHaveBeenCalledWith({
      code: 'SERVEASE10',
      description: 'Demo discount',
      discountType: 'percent',
      discountValue: 10,
      maxDiscountAmount: 300,
      minOrderAmount: 500,
      startsAt: null,
      endsAt: null,
      isActive: true,
    });
  });

  it('rejects invalid promotion inputs before repository writes', async () => {
    const repository = {
      upsertPromotion: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await expect(
      service.upsertPromotion({
        code: '',
        discountType: 'percent',
        discountValue: 10,
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    await expect(
      service.upsertPromotion({
        code: 'SAVE',
        discountType: 'fixed',
        discountValue: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.upsertPromotion).not.toHaveBeenCalled();
  });

  it('rejects refunds without an admin user or rejection reason', async () => {
    const repository = {
      decideRefund: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await expect(
      service.approveRefund('refund-1', ''),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    await expect(
      service.rejectRefund('refund-1', 'admin-1', ' '),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.decideRefund).not.toHaveBeenCalled();
  });

  it('normalizes refund approval and rejection decisions', async () => {
    const repository = {
      decideRefund: jest.fn().mockResolvedValue({ id: 'refund-1' }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await service.approveRefund('refund-1', 'admin-1', ' Approved ');
    await service.rejectRefund('refund-1', 'admin-1', ' Missing evidence ');

    expect(repository.decideRefund).toHaveBeenNthCalledWith(
      1,
      'refund-1',
      'admin-1',
      'approved',
      'Approved',
    );
    expect(repository.decideRefund).toHaveBeenNthCalledWith(
      2,
      'refund-1',
      'admin-1',
      'rejected',
      'Missing evidence',
    );
  });

  it('syncs admin payments from the latest APICenter checkout', async () => {
    const repository = {
      getLatestApicenterCheckoutId: jest.fn().mockResolvedValue('checkout-1'),
      adminGetPayment: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'paid',
      }),
    } as unknown as SupabasePaymentRepository;
    const sharedPaymentService = {
      getCheckoutStatus: jest.fn().mockResolvedValue({
        checkoutId: 'checkout-1',
        localPaymentStatus: 'paid',
      }),
    };
    const service = new PaymentAdminService(
      repository,
      sharedPaymentService as never,
    );

    const payment = await service.syncPaymentWithApicenter(' payment-1 ');

    expect(repository.getLatestApicenterCheckoutId).toHaveBeenCalledWith(
      'payment-1',
    );
    expect(sharedPaymentService.getCheckoutStatus).toHaveBeenCalledWith(
      'checkout-1',
    );
    expect(repository.adminGetPayment).toHaveBeenCalledWith('payment-1');
    expect(payment).toEqual({ id: 'payment-1', status: 'paid' });
  });

  it('normalizes admin payment release requests before repository writes', async () => {
    const repository = {
      releasePaymentToProvider: jest.fn().mockResolvedValue({
        id: 'payout-1',
        status: 'processing',
      }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    const payout = await service.releasePaymentToProvider({
      paymentId: ' payment-1 ',
      adminUserId: ' admin-1 ',
      note: ' Release now ',
    });

    expect(repository.releasePaymentToProvider).toHaveBeenCalledWith({
      paymentId: 'payment-1',
      adminUserId: 'admin-1',
      note: 'Release now',
    });
    expect(payout.status).toBe('processing');
  });

  it('rejects admin payment release without a payment or admin user', async () => {
    const repository = {
      releasePaymentToProvider: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await expect(
      service.releasePaymentToProvider({
        paymentId: '',
        adminUserId: 'admin-1',
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    await expect(
      service.releasePaymentToProvider({
        paymentId: 'payment-1',
        adminUserId: '',
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.releasePaymentToProvider).not.toHaveBeenCalled();
  });

  it('rejects invalid commission rules before repository writes', async () => {
    const repository = {
      updateCommissionRule: jest.fn(),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await expect(
      service.updateCommissionRule({
        ruleId: 'platform-default',
        currentRate: 101,
        status: 'active',
        adminUserId: 'admin-1',
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    await expect(
      service.updateCommissionRule({
        ruleId: 'platform-default',
        currentRate: 15,
        status: 'archived',
        adminUserId: 'admin-1',
      }),
    ).rejects.toBeInstanceOf(InvalidPaymentRequestError);
    expect(repository.updateCommissionRule).not.toHaveBeenCalled();
  });

  it('normalizes commission rule updates before repository writes', async () => {
    const repository = {
      updateCommissionRule: jest.fn().mockResolvedValue({ id: 'platform-default' }),
    } as unknown as SupabasePaymentRepository;
    const service = new PaymentAdminService(repository);

    await service.updateCommissionRule({
      ruleId: ' platform-default ',
      currentRate: 16,
      adminUserId: 'admin-1',
    });

    expect(repository.updateCommissionRule).toHaveBeenCalledWith({
      ruleId: 'platform-default',
      currentRate: 16,
      status: 'active',
      adminUserId: 'admin-1',
    });
  });
});
