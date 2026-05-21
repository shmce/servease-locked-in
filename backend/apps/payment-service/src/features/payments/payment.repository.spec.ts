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

  it('validates promotion codes through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        code: 'SERVEASE10',
        valid: true,
        discount_amount: 120,
        final_amount: 1080,
        message: 'Demo ten percent service discount.',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const promotion = await repository.validatePromotion('SERVEASE10', 1200);

    expect(rpc).toHaveBeenCalledWith('servease_validate_promotion', {
      p_code: 'SERVEASE10',
      p_amount: 1200,
    });
    expect(promotion).toEqual({
      code: 'SERVEASE10',
      valid: true,
      discountAmount: 120,
      finalAmount: 1080,
      message: 'Demo ten percent service discount.',
    });
  });

  it('records APICenter checkout sessions through the payment-owned RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        payment_id: 'payment-1',
        booking_id: 'booking-1',
        local_payment_status: 'pending',
        paid_at: null,
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const result = await repository.recordApicenterCheckout({
      bookingId: 'booking-1',
      customerId: 'customer-1',
      providerId: 'provider-1',
      amount: 1200,
      paymentMethod: 'gcash',
      session: {
        checkoutId: 'checkout-1',
        provider: 'paymongo',
        providerMode: 'test',
        status: 'created',
        referenceId: 'booking-1',
        redirectUrl: 'https://pay.test/checkout-1',
        expiresAt: '2026-05-18T10:00:00.000Z',
        amount: { value: 120000, currency: 'PHP' },
        currency: 'PHP',
        paymentMethodsAllowed: ['gcash'],
        metadata: { bookingId: 'booking-1' },
      },
    });

    expect(rpc).toHaveBeenCalledWith('servease_record_apicenter_checkout', {
      p_booking_id: 'booking-1',
      p_customer_id: 'customer-1',
      p_provider_id: 'provider-1',
      p_amount: 1200,
      p_payment_method: 'gcash',
      p_checkout_id: 'checkout-1',
      p_provider: 'paymongo',
      p_provider_mode: 'test',
      p_checkout_status: 'created',
      p_reference_id: 'booking-1',
      p_redirect_url: 'https://pay.test/checkout-1',
      p_expires_at: '2026-05-18T10:00:00.000Z',
      p_amount_value: 120000,
      p_amount_currency: 'PHP',
      p_currency: 'PHP',
      p_payment_methods_allowed: ['gcash'],
      p_metadata: { bookingId: 'booking-1' },
    });
    expect(result).toEqual({
      paymentId: 'payment-1',
      bookingId: 'booking-1',
      localPaymentStatus: 'pending',
      paidAt: null,
    });
  });

  it('syncs APICenter checkout status through the payment-owned RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        payment_id: 'payment-1',
        booking_id: 'booking-1',
        local_payment_status: 'paid',
        paid_at: '2026-05-18T10:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const result = await repository.syncApicenterCheckoutStatus({
      checkoutId: 'checkout-1',
      status: 'paid',
      referenceId: 'booking-1',
      redirectUrl: 'https://pay.test/checkout-1',
    });

    expect(rpc).toHaveBeenCalledWith('servease_sync_apicenter_checkout_status', {
      p_checkout_id: 'checkout-1',
      p_checkout_status: 'paid',
      p_provider_mode: null,
      p_reference_id: 'booking-1',
      p_redirect_url: 'https://pay.test/checkout-1',
      p_expires_at: null,
      p_amount_value: null,
      p_amount_currency: null,
      p_currency: null,
      p_payment_methods_allowed: [],
      p_metadata: {},
    });
    expect(result.localPaymentStatus).toBe('paid');
  });

  it('loads the latest APICenter checkout id for admin payment sync', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: { checkout_id: 'checkout-1' },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const checkoutId =
      await repository.getLatestApicenterCheckoutId('payment-1');

    expect(rpc).toHaveBeenCalledWith(
      'servease_admin_get_apicenter_checkout_for_payment',
      { p_payment_id: 'payment-1' },
    );
    expect(checkoutId).toBe('checkout-1');
  });

  it('lists visible payments with APICenter checkout metadata', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'payment-1',
          booking_id: 'booking-1',
          customer_id: 'customer-1',
          provider_id: 'provider-1',
          amount: 1200,
          platform_fee: 180,
          provider_payout: 1020,
          status: 'pending',
          payment_method: 'gcash',
          paid_at: null,
          created_at: '2026-05-18T10:00:00.000Z',
          failure_reason: null,
          failure_code: null,
          retry_count: 0,
          last_retry_at: null,
          dispute_id: null,
          apicenter_checkout_id: 'checkout-1',
          apicenter_checkout_status: 'created',
          apicenter_provider: 'paymongo',
          apicenter_provider_mode: 'test',
        },
      ],
      error: null,
    });
    const repository = new SupabasePaymentRepository({ rpc });

    const payments = await repository.listPayments({
      customerId: 'customer-1',
      providerId: null,
    });

    expect(rpc).toHaveBeenCalledWith('servease_list_visible_payments', {
      p_customer_id: 'customer-1',
      p_provider_id: null,
    });
    expect(payments[0]).toMatchObject({
      id: 'payment-1',
      apicenterCheckoutId: 'checkout-1',
      apicenterCheckoutStatus: 'created',
      apicenterProvider: 'paymongo',
      apicenterProviderMode: 'test',
    });
  });

  it('lists admin promotions through the service RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'promo-1',
          code: 'SERVEASE10',
          description: 'Demo discount.',
          discount_type: 'percent',
          discount_value: 10,
          max_discount_amount: 300,
          min_order_amount: 500,
          starts_at: null,
          ends_at: null,
          is_active: true,
          status: 'active',
          created_at: '2026-05-16T00:00:00.000Z',
        },
      ],
      error: null,
    });
    const repository = new SupabasePaymentRepository({ rpc });

    const promotions = await repository.listPromotions('active');

    expect(rpc).toHaveBeenCalledWith('servease_admin_list_promotions', {
      p_status: 'active',
    });
    expect(promotions[0]).toMatchObject({
      code: 'SERVEASE10',
      discountType: 'percent',
      status: 'active',
    });
  });

  it('upserts admin promotions through the service RPC', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'promo-1',
        code: 'SERVEASE10',
        description: 'Demo discount.',
        discount_type: 'percent',
        discount_value: 10,
        max_discount_amount: 300,
        min_order_amount: 500,
        starts_at: null,
        ends_at: null,
        is_active: true,
        status: 'active',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const promotion = await repository.upsertPromotion({
      code: 'SERVEASE10',
      discountType: 'percent',
      discountValue: 10,
      maxDiscountAmount: 300,
      minOrderAmount: 500,
    });

    expect(rpc).toHaveBeenCalledWith('servease_admin_upsert_promotion', {
      p_promotion_id: null,
      p_code: 'SERVEASE10',
      p_description: null,
      p_discount_type: 'percent',
      p_discount_value: 10,
      p_max_discount_amount: 300,
      p_min_order_amount: 500,
      p_starts_at: null,
      p_ends_at: null,
      p_is_active: true,
    });
    expect(promotion.id).toBe('promo-1');
  });

  it('lists and decides admin refunds through service RPCs', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'refund-1',
        payment_id: 'payment-1',
        booking_id: 'booking-1',
        customer_id: 'customer-1',
        provider_id: 'provider-1',
        amount: 1500,
        reason: 'Customer requested review',
        status: 'approved',
        requested_at: '2026-05-16T00:00:00.000Z',
        decided_by: 'admin-1',
        decision_reason: 'Approved',
        decided_at: '2026-05-16T00:01:00.000Z',
        processed_at: null,
        created_at: '2026-05-16T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: 'refund-1',
            payment_id: 'payment-1',
            booking_id: 'booking-1',
            customer_id: 'customer-1',
            provider_id: 'provider-1',
            amount: 1500,
            reason: 'Customer requested review',
            status: 'requested',
            requested_at: '2026-05-16T00:00:00.000Z',
            decided_by: null,
            decision_reason: null,
            decided_at: null,
            processed_at: null,
            created_at: '2026-05-16T00:00:00.000Z',
          },
        ],
        error: null,
      })
      .mockReturnValueOnce({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const refunds = await repository.listRefunds('requested');
    const approved = await repository.decideRefund(
      'refund-1',
      'admin-1',
      'approved',
      'Approved',
    );

    expect(rpc).toHaveBeenNthCalledWith(
      1,
      'servease_admin_list_refund_requests',
      { p_status: 'requested' },
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      'servease_admin_decide_refund_request',
      {
        p_refund_id: 'refund-1',
        p_admin_user_id: 'admin-1',
        p_status: 'approved',
        p_reason: 'Approved',
      },
    );
    expect(refunds[0].status).toBe('requested');
    expect(approved.status).toBe('approved');
  });

  it('lists and updates commission rules through service RPCs', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'platform-default',
        category_key: 'platform-default',
        category_label: 'Platform Default',
        current_rate: 16,
        previous_rate: 15,
        status: 'active',
        monthly_revenue: 0,
        monthly_commission: 0,
        updated_by: 'admin-1',
        updated_at: '2026-05-16T00:01:00.000Z',
        created_at: '2026-05-16T00:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: 'platform-default',
            category_key: 'platform-default',
            category_label: 'Platform Default',
            current_rate: 15,
            previous_rate: 15,
            status: 'active',
            monthly_revenue: 0,
            monthly_commission: 0,
            updated_by: null,
            updated_at: '2026-05-16T00:00:00.000Z',
            created_at: '2026-05-16T00:00:00.000Z',
          },
        ],
        error: null,
      })
      .mockReturnValueOnce({ maybeSingle });
    const repository = new SupabasePaymentRepository({ rpc });

    const rules = await repository.listCommissionRules();
    const updated = await repository.updateCommissionRule({
      ruleId: 'platform-default',
      currentRate: 16,
      status: 'active',
      adminUserId: 'admin-1',
    });

    expect(rpc).toHaveBeenNthCalledWith(
      1,
      'servease_admin_list_commission_rules',
      {},
    );
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      'servease_admin_update_commission_rule',
      {
        p_rule_id: 'platform-default',
        p_current_rate: 16,
        p_status: 'active',
        p_admin_user_id: 'admin-1',
      },
    );
    expect(rules[0].currentRate).toBe(15);
    expect(updated.currentRate).toBe(16);
  });
});
