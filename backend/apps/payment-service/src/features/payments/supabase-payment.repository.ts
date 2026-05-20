import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  InvalidPaymentRequestError,
  PaymentNotFoundError,
} from './payment.errors';
import {
  CreatePaymentInput,
  ConfirmCashOnServicePaymentInput,
  ApicenterCheckoutSyncSummary,
  CommissionRuleStatus,
  CommissionRuleSummary,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PaymentSummary,
  PaymentVisibility,
  PaymentStatus,
  RefundStatus,
  RefundSummary,
  PromotionDiscountType,
  PromotionValidationSummary,
  PromotionStatus,
  PromotionSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutStatus,
  PayoutEventSummary,
  PayoutEventType,
  PayoutSummary,
  RecordPayoutEventInput,
  ReleasePaymentToProviderInput,
  RecordApicenterCheckoutInput,
  UpsertPayoutMethodInput,
  CreatePayoutRequestInput,
  UpsertCustomerPaymentMethodInput,
  UpsertPromotionInput,
} from './payment.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<
      string,
      | string
      | number
      | boolean
      | string[]
      | Record<string, string>
      | null
    >,
  ): PromiseLike<{
    data:
      | PaymentRow[]
      | PayoutMethodRow[]
      | CustomerPaymentMethodRow[]
      | CommissionRuleRow[]
      | PayoutRow[]
      | PayoutEventRow[]
      | PayoutAccountRow[]
      | RefundRow[]
      | ApicenterPaymentCheckoutRow[]
      | PromotionValidationRow[]
      | PromotionRow[]
      | ApicenterCheckoutSyncRow[]
      | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data:
        | PaymentRow
        | PayoutMethodRow
        | CustomerPaymentMethodRow
        | CommissionRuleRow
        | PayoutRow
        | PayoutEventRow
        | PayoutAccountRow
        | RefundRow
        | ApicenterPaymentCheckoutRow
        | PromotionValidationRow
        | PromotionRow
        | ApicenterCheckoutSyncRow
        | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface PayoutMethodRow {
  id: string;
  provider_id: string;
  method_type: 'bank' | 'gcash' | 'paymaya';
  account_label: string;
  account_name: string | null;
  account_number_last4: string | null;
  is_default: boolean | null;
  created_at: string | null;
}

interface CustomerPaymentMethodRow {
  id: string;
  customer_id: string;
  method_type: CustomerPaymentMethodType;
  label: string;
  brand: string | null;
  last4: string | null;
  is_default: boolean | null;
  created_at: string | null;
}

interface CommissionRuleRow {
  id: string;
  category_key: string;
  category_label: string;
  current_rate: string | number | null;
  previous_rate: string | number | null;
  status: CommissionRuleStatus;
  monthly_revenue: string | number | null;
  monthly_commission: string | number | null;
  updated_by: string | null;
  updated_at: string | null;
  created_at: string | null;
}

interface PayoutRow {
  id: string;
  payment_id: string | null;
  provider_id: string;
  amount: string | number | null;
  processing_fee: string | number | null;
  net_amount: string | number | null;
  status: PayoutStatus;
  payout_method_id: string | null;
  method_type: string | null;
  account_label: string | null;
  reference: string | null;
  period_start: string | null;
  period_end: string | null;
  requested_at: string | null;
  paid_at: string | null;
  created_at: string | null;
}

interface PayoutEventRow {
  id: string;
  payout_id: string;
  event_type: PayoutEventType;
  status: PayoutStatus;
  bank_reference: string | null;
  note: string | null;
  admin_user_id: string | null;
  created_at: string | null;
}

interface PayoutAccountRow {
  available_balance: string | number | null;
  pending_balance: string | number | null;
  total_paid_out: string | number | null;
  next_payout_date: string | null;
}

interface PaymentRow {
  id: string;
  booking_id: string;
  customer_id: string | null;
  provider_id: string | null;
  amount: string | number | null;
  platform_fee: string | number | null;
  provider_payout: string | number | null;
  status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string | null;
  failure_reason: string | null;
  failure_code: string | null;
  retry_count: number | string | null;
  last_retry_at: string | null;
  dispute_id: string | null;
  apicenter_checkout_id?: string | null;
  apicenter_checkout_status?: string | null;
  apicenter_provider?: string | null;
  apicenter_provider_mode?: string | null;
}

interface ApicenterPaymentCheckoutRow {
  checkout_id: string | null;
}

interface RefundRow {
  id: string;
  payment_id: string;
  booking_id: string;
  customer_id: string | null;
  provider_id: string | null;
  amount: string | number | null;
  reason: string | null;
  status: RefundStatus;
  requested_at: string | null;
  decided_by: string | null;
  decision_reason: string | null;
  decided_at: string | null;
  processed_at: string | null;
  created_at: string | null;
}

interface PromotionValidationRow {
  code: string;
  valid: boolean | null;
  discount_amount: string | number | null;
  final_amount: string | number | null;
  message: string | null;
}

interface PromotionRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: PromotionDiscountType;
  discount_value: string | number | null;
  max_discount_amount: string | number | null;
  min_order_amount: string | number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean | null;
  status: PromotionStatus;
  created_at: string | null;
}

interface ApicenterCheckoutSyncRow {
  payment_id: string;
  booking_id: string;
  local_payment_status: PaymentStatus;
  paid_at: string | null;
}

@Injectable()
export class SupabasePaymentRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_payment', {
        p_booking_id: input.bookingId,
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_amount: input.amount,
        p_payment_method: input.paymentMethod,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async confirmCashOnServicePayment(
    input: ConfirmCashOnServicePaymentInput,
  ): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_confirm_cash_on_service_payment', {
        p_booking_id: input.bookingId,
        p_provider_id: input.providerId ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      if (error.message.includes('invalid_payment_request')) {
        throw new InvalidPaymentRequestError();
      }
      throw new Error(`Failed to confirm cash payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_visible_payments', {
      p_customer_id: visibility.customerId,
      p_provider_id: visibility.providerId,
    });

    if (error) {
      throw new Error(`Failed to list payments: ${error.message}`);
    }

    return ((data ?? []) as PaymentRow[]).map((row) => this.mapPayment(row));
  }

  async validatePromotion(
    code: string,
    amount: number,
  ): Promise<PromotionValidationSummary> {
    const { data, error } = await this.client
      .rpc('servease_validate_promotion', {
        p_code: code,
        p_amount: amount,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to validate promotion: ${error.message}`);
    }

    if (!data) {
      return {
        code: code.trim().toUpperCase(),
        valid: false,
        discountAmount: 0,
        finalAmount: amount,
        message: 'Promo code is not valid.',
      };
    }

    return this.mapPromotionValidation(data as PromotionValidationRow);
  }

  async recordApicenterCheckout(
    input: RecordApicenterCheckoutInput,
  ): Promise<ApicenterCheckoutSyncSummary> {
    const { data, error } = await this.client
      .rpc('servease_record_apicenter_checkout', {
        p_booking_id: input.bookingId,
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_amount: input.amount,
        p_payment_method: input.paymentMethod,
        p_provider: input.session.provider,
        ...this.checkoutStatusRpcArgs(input.session),
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to record APICenter checkout: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapApicenterCheckoutSync(data as ApicenterCheckoutSyncRow);
  }

  async syncApicenterCheckoutStatus(
    session: Pick<
      RecordApicenterCheckoutInput['session'],
      | 'checkoutId'
      | 'status'
      | 'referenceId'
      | 'redirectUrl'
      | 'expiresAt'
      | 'amount'
      | 'currency'
      | 'paymentMethodsAllowed'
      | 'metadata'
    >,
  ): Promise<ApicenterCheckoutSyncSummary> {
    const { data, error } = await this.client
      .rpc(
        'servease_sync_apicenter_checkout_status',
        this.checkoutStatusRpcArgs(session),
      )
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to sync APICenter checkout: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapApicenterCheckoutSync(data as ApicenterCheckoutSyncRow);
  }

  async listAllPayments(status: PaymentStatus | null): Promise<PaymentSummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_payments', {
      p_status: status,
    });

    if (error) {
      throw new Error(`Failed to list admin payments: ${error.message}`);
    }

    return ((data ?? []) as PaymentRow[]).map((row) => this.mapPayment(row));
  }

  async adminGetPayment(paymentId: string): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_payment', { p_payment_id: paymentId })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get admin payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_payment_status', {
        p_payment_id: paymentId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_record_payment_failure', {
        p_payment_id: paymentId,
        p_failure_reason: failureReason,
        p_failure_code: failureCode,
        p_dispute_id: disputeId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to record payment failure: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async retryPayment(paymentId: string): Promise<PaymentSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_retry_payment', {
        p_payment_id: paymentId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retry payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayment(data as PaymentRow);
  }

  async getLatestApicenterCheckoutId(paymentId: string): Promise<string> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_apicenter_checkout_for_payment', {
        p_payment_id: paymentId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to get APICenter checkout: ${error.message}`);
    }

    const checkoutId = (data as ApicenterPaymentCheckoutRow | null)?.checkout_id;
    if (!checkoutId) {
      throw new PaymentNotFoundError();
    }

    return checkoutId;
  }

  async listPromotions(
    status: PromotionStatus | null,
  ): Promise<PromotionSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_promotions',
      {
        p_status: status,
      },
    );

    if (error) {
      throw new Error(`Failed to list promotions: ${error.message}`);
    }

    return ((data ?? []) as PromotionRow[]).map((row) =>
      this.mapPromotion(row),
    );
  }

  async upsertPromotion(input: UpsertPromotionInput): Promise<PromotionSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_upsert_promotion', {
        p_promotion_id: input.promotionId ?? null,
        p_code: input.code,
        p_description: input.description ?? null,
        p_discount_type: input.discountType,
        p_discount_value: input.discountValue,
        p_max_discount_amount: input.maxDiscountAmount ?? null,
        p_min_order_amount: input.minOrderAmount ?? 0,
        p_starts_at: input.startsAt ?? null,
        p_ends_at: input.endsAt ?? null,
        p_is_active: input.isActive ?? true,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to upsert promotion: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPromotion(data as PromotionRow);
  }

  async deletePromotion(promotionId: string): Promise<PromotionSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_delete_promotion', {
        p_promotion_id: promotionId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to delete promotion: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPromotion(data as PromotionRow);
  }

  async listAllPayouts(status: PayoutStatus | null): Promise<PayoutSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_provider_payouts',
      {
        p_status: status,
      },
    );

    if (error) {
      throw new Error(`Failed to list admin payouts: ${error.message}`);
    }

    return ((data ?? []) as PayoutRow[]).map((row) => this.mapPayout(row));
  }

  async updatePayoutStatus(
    payoutId: string,
    status: PayoutStatus,
  ): Promise<PayoutSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_provider_payout_status', {
        p_payout_id: payoutId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to update payout: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayout(data as PayoutRow);
  }

  async releasePaymentToProvider(
    input: ReleasePaymentToProviderInput,
  ): Promise<PayoutSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_release_payment_to_provider', {
        p_payment_id: input.paymentId,
        p_admin_user_id: input.adminUserId,
        p_note: input.note ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      if (error.message.includes('invalid_payment_request')) {
        throw new InvalidPaymentRequestError();
      }
      throw new Error(`Failed to release payment: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayout(data as PayoutRow);
  }

  async listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_provider_payout_events',
      {
        p_payout_id: payoutId,
      },
    );

    if (error) {
      throw new Error(`Failed to list payout events: ${error.message}`);
    }

    return ((data ?? []) as PayoutEventRow[]).map((row) =>
      this.mapPayoutEvent(row),
    );
  }

  async recordPayoutEvent(
    input: RecordPayoutEventInput,
  ): Promise<PayoutEventSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_record_provider_payout_event', {
        p_payout_id: input.payoutId,
        p_event_type: input.eventType,
        p_status: input.status,
        p_bank_reference: input.bankReference ?? null,
        p_note: input.note ?? null,
        p_admin_user_id: input.adminUserId ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('invalid_payment_request')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to record payout event: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayoutEvent(data as PayoutEventRow);
  }

  async listRefunds(status: RefundStatus | null): Promise<RefundSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_refund_requests',
      {
        p_status: status,
      },
    );

    if (error) {
      throw new Error(`Failed to list admin refunds: ${error.message}`);
    }

    return ((data ?? []) as RefundRow[]).map((row) => this.mapRefund(row));
  }

  async decideRefund(
    refundId: string,
    adminUserId: string,
    status: Exclude<RefundStatus, 'requested'>,
    reason: string | null,
  ): Promise<RefundSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_decide_refund_request', {
        p_refund_id: refundId,
        p_admin_user_id: adminUserId,
        p_status: status,
        p_reason: reason,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to decide refund: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapRefund(data as RefundRow);
  }

  async listCommissionRules(): Promise<CommissionRuleSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_commission_rules',
      {},
    );

    if (error) {
      throw new Error(`Failed to list commission rules: ${error.message}`);
    }

    return ((data ?? []) as CommissionRuleRow[]).map((row) =>
      this.mapCommissionRule(row),
    );
  }

  async updateCommissionRule(input: {
    ruleId: string;
    currentRate: number;
    status: CommissionRuleStatus;
    adminUserId: string;
  }): Promise<CommissionRuleSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_commission_rule', {
        p_rule_id: input.ruleId,
        p_current_rate: input.currentRate,
        p_status: input.status,
        p_admin_user_id: input.adminUserId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to update commission rule: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapCommissionRule(data as CommissionRuleRow);
  }

  async listPayoutMethods(providerId: string): Promise<PayoutMethodSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_provider_payout_methods',
      {
        p_provider_id: providerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list payout methods: ${error.message}`);
    }

    return ((data ?? []) as PayoutMethodRow[]).map((row) =>
      this.mapPayoutMethod(row),
    );
  }

  async upsertPayoutMethod(
    input: UpsertPayoutMethodInput,
  ): Promise<PayoutMethodSummary> {
    const { data, error } = await this.client
      .rpc('servease_upsert_provider_payout_method', {
        p_provider_id: input.providerId,
        p_method_id: input.methodId ?? null,
        p_method_type: input.methodType,
        p_account_label: input.accountLabel,
        p_account_name: input.accountName ?? null,
        p_account_number_last4: input.accountNumberLast4 ?? null,
        p_is_default: input.isDefault ?? false,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to upsert payout method: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayoutMethod(data as PayoutMethodRow);
  }

  async listCustomerPaymentMethods(
    customerId: string,
  ): Promise<CustomerPaymentMethodSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_customer_payment_methods',
      {
        p_customer_id: customerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list customer payment methods: ${error.message}`);
    }

    return ((data ?? []) as CustomerPaymentMethodRow[]).map((row) =>
      this.mapCustomerPaymentMethod(row),
    );
  }

  async upsertCustomerPaymentMethod(
    input: UpsertCustomerPaymentMethodInput,
  ): Promise<CustomerPaymentMethodSummary> {
    const { data, error } = await this.client
      .rpc('servease_upsert_customer_payment_method', {
        p_customer_id: input.customerId,
        p_method_id: input.methodId ?? null,
        p_method_type: input.methodType,
        p_label: input.label,
        p_brand: input.brand ?? null,
        p_last4: input.last4 ?? null,
        p_is_default: input.isDefault ?? false,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to upsert customer payment method: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapCustomerPaymentMethod(data as CustomerPaymentMethodRow);
  }

  async deleteCustomerPaymentMethod(
    customerId: string,
    methodId: string,
  ): Promise<CustomerPaymentMethodSummary> {
    const { data, error } = await this.client
      .rpc('servease_delete_customer_payment_method', {
        p_customer_id: customerId,
        p_method_id: methodId,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('payment_not_found')) {
        throw new PaymentNotFoundError();
      }
      throw new Error(`Failed to delete customer payment method: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapCustomerPaymentMethod(data as CustomerPaymentMethodRow);
  }

  async getPayoutAccount(providerId: string): Promise<PayoutAccountSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_provider_payout_account', {
        p_provider_id: providerId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get payout account: ${error.message}`);
    }

    if (!data) {
      return {
        availableBalance: 0,
        pendingBalance: 0,
        totalPaidOut: 0,
        nextPayoutDate: null,
      };
    }

    const row = data as PayoutAccountRow;
    return {
      availableBalance: Number(row.available_balance ?? 0),
      pendingBalance: Number(row.pending_balance ?? 0),
      totalPaidOut: Number(row.total_paid_out ?? 0),
      nextPayoutDate: row.next_payout_date,
    };
  }

  async listPayouts(providerId: string): Promise<PayoutSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_list_provider_payouts',
      {
        p_provider_id: providerId,
      },
    );

    if (error) {
      throw new Error(`Failed to list payouts: ${error.message}`);
    }

    return ((data ?? []) as PayoutRow[]).map((row) => this.mapPayout(row));
  }

  async createPayoutRequest(
    input: CreatePayoutRequestInput,
  ): Promise<PayoutSummary> {
    const { data, error } = await this.client
      .rpc('servease_request_provider_payout', {
        p_provider_id: input.providerId,
        p_requested_by: input.userId,
        p_amount: input.amount,
        p_payout_method_id: input.payoutMethodId,
        p_idempotency_key: input.idempotencyKey ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to request payout: ${error.message}`);
    }

    if (!data) {
      throw new PaymentNotFoundError();
    }

    return this.mapPayout(data as PayoutRow);
  }

  private mapPayment(row: PaymentRow): PaymentSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      amount: Number(row.amount ?? 0),
      platformFee: Number(row.platform_fee ?? 0),
      providerPayout: Number(row.provider_payout ?? 0),
      status: row.status,
      paymentMethod: row.payment_method,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      failureReason: row.failure_reason ?? null,
      failureCode: row.failure_code ?? null,
      retryCount: Number(row.retry_count ?? 0),
      lastRetryAt: row.last_retry_at,
      disputeId: row.dispute_id ?? null,
      apicenterCheckoutId: row.apicenter_checkout_id ?? null,
      apicenterCheckoutStatus: row.apicenter_checkout_status ?? null,
      apicenterProvider: row.apicenter_provider ?? null,
      apicenterProviderMode: row.apicenter_provider_mode ?? null,
    };
  }

  private checkoutStatusRpcArgs(
    session: Pick<
      RecordApicenterCheckoutInput['session'],
      | 'checkoutId'
      | 'providerMode'
      | 'status'
      | 'referenceId'
      | 'redirectUrl'
      | 'expiresAt'
      | 'amount'
      | 'currency'
      | 'paymentMethodsAllowed'
      | 'metadata'
    >,
  ): Record<
    string,
    string | number | string[] | Record<string, string> | null
  > {
    return {
      p_checkout_id: session.checkoutId,
      p_provider_mode: session.providerMode ?? null,
      p_checkout_status: session.status,
      p_reference_id: session.referenceId,
      p_redirect_url: session.redirectUrl,
      p_expires_at: session.expiresAt ?? null,
      p_amount_value: session.amount?.value ?? null,
      p_amount_currency: session.amount?.currency ?? null,
      p_currency: session.currency ?? null,
      p_payment_methods_allowed: session.paymentMethodsAllowed ?? [],
      p_metadata: session.metadata ?? {},
    };
  }

  private mapApicenterCheckoutSync(
    row: ApicenterCheckoutSyncRow,
  ): ApicenterCheckoutSyncSummary {
    return {
      paymentId: row.payment_id,
      bookingId: row.booking_id,
      localPaymentStatus: row.local_payment_status,
      paidAt: row.paid_at,
    };
  }

  private mapPromotionValidation(
    row: PromotionValidationRow,
  ): PromotionValidationSummary {
    return {
      code: row.code,
      valid: row.valid ?? false,
      discountAmount: Number(row.discount_amount ?? 0),
      finalAmount: Number(row.final_amount ?? 0),
      message: row.message ?? '',
    };
  }

  private mapPromotion(row: PromotionRow): PromotionSummary {
    return {
      id: row.id,
      code: row.code,
      description: row.description,
      discountType: row.discount_type,
      discountValue: Number(row.discount_value ?? 0),
      maxDiscountAmount:
        row.max_discount_amount === null ? null : Number(row.max_discount_amount),
      minOrderAmount: Number(row.min_order_amount ?? 0),
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      isActive: row.is_active ?? false,
      status: row.status,
      createdAt: row.created_at,
    };
  }

  private mapPayoutMethod(row: PayoutMethodRow): PayoutMethodSummary {
    return {
      id: row.id,
      providerId: row.provider_id,
      methodType: row.method_type,
      accountLabel: row.account_label,
      accountName: row.account_name,
      accountNumberLast4: row.account_number_last4,
      isDefault: row.is_default ?? false,
      createdAt: row.created_at,
    };
  }

  private mapCustomerPaymentMethod(
    row: CustomerPaymentMethodRow,
  ): CustomerPaymentMethodSummary {
    return {
      id: row.id,
      customerId: row.customer_id,
      methodType: row.method_type,
      label: row.label,
      brand: row.brand,
      last4: row.last4,
      isDefault: row.is_default ?? false,
      createdAt: row.created_at,
    };
  }

  private mapPayout(row: PayoutRow): PayoutSummary {
    return {
      id: row.id,
      paymentId: row.payment_id ?? null,
      providerId: row.provider_id,
      amount: Number(row.amount ?? 0),
      processingFee: Number(row.processing_fee ?? 0),
      netAmount: Number(row.net_amount ?? 0),
      status: row.status,
      payoutMethodId: row.payout_method_id,
      methodType: row.method_type,
      accountLabel: row.account_label,
      reference: row.reference,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      requestedAt: row.requested_at,
      paidAt: row.paid_at,
      createdAt: row.created_at,
    };
  }

  private mapPayoutEvent(row: PayoutEventRow): PayoutEventSummary {
    return {
      id: row.id,
      payoutId: row.payout_id,
      eventType: row.event_type,
      status: row.status,
      bankReference: row.bank_reference,
      note: row.note,
      adminUserId: row.admin_user_id,
      createdAt: row.created_at,
    };
  }

  private mapRefund(row: RefundRow): RefundSummary {
    return {
      id: row.id,
      paymentId: row.payment_id,
      bookingId: row.booking_id,
      customerId: row.customer_id,
      providerId: row.provider_id,
      amount: Number(row.amount ?? 0),
      reason: row.reason ?? '',
      status: row.status,
      requestedAt: row.requested_at,
      decidedBy: row.decided_by,
      decisionReason: row.decision_reason,
      decidedAt: row.decided_at,
      processedAt: row.processed_at,
      createdAt: row.created_at,
    };
  }

  private mapCommissionRule(row: CommissionRuleRow): CommissionRuleSummary {
    return {
      id: row.id,
      categoryKey: row.category_key,
      categoryLabel: row.category_label,
      currentRate: Number(row.current_rate ?? 0),
      previousRate: Number(row.previous_rate ?? 0),
      status: row.status,
      monthlyRevenue: Number(row.monthly_revenue ?? 0),
      monthlyCommission: Number(row.monthly_commission ?? 0),
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
