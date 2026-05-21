import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentSummary,
  CreatePricingFuelIndexRequest,
  CommissionRuleSummary,
  PayoutEventSummary,
  PricingCategoryRuleSummary,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  PromotionSummary,
  PayoutSummary,
  RecordPayoutEventRequest,
  RefundSummary,
  SyncPricingFuelIndexRequest,
  UpsertPromotionRequest,
  UpsertPricingCategoryRuleRequest,
  UpdateCommissionRuleRequest,
} from '../admin-payment.types';

export class PaymentServiceRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

@Injectable()
export class PaymentServiceClient {
  constructor(private readonly configService: ConfigService) {}

  getPayment(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}`,
      'GET',
    );
  }

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PaymentSummary[]>(
      `/internal/admin/payments?${searchParams.toString()}`,
      'GET',
    );
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/failure`,
      'POST',
      {
        failureReason,
        failureCode,
        disputeId,
      },
    );
  }

  retryPayment(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/retry`,
      'POST',
    );
  }

  syncPaymentWithApicenter(paymentId: string): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/apicenter-sync`,
      'POST',
    );
  }

  listPromotions(status?: string | null): Promise<PromotionSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PromotionSummary[]>(
      `/internal/admin/payments/promotions?${searchParams.toString()}`,
      'GET',
    );
  }

  createPromotion(input: UpsertPromotionRequest): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      '/internal/admin/payments/promotions',
      'POST',
      input,
    );
  }

  updatePromotion(
    promotionId: string,
    input: UpsertPromotionRequest,
  ): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      `/internal/admin/payments/promotions/${promotionId}`,
      'PATCH',
      input,
    );
  }

  deletePromotion(promotionId: string): Promise<PromotionSummary> {
    return this.request<PromotionSummary>(
      `/internal/admin/payments/promotions/${promotionId}`,
      'DELETE',
    );
  }

  listPayouts(status?: string | null): Promise<PayoutSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PayoutSummary[]>(
      `/internal/admin/payments/payouts?${searchParams.toString()}`,
      'GET',
    );
  }

  updatePayoutStatus(
    payoutId: string,
    status: string,
  ): Promise<PayoutSummary> {
    return this.request<PayoutSummary>(
      `/internal/admin/payments/payouts/${payoutId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  releasePaymentToProvider(
    paymentId: string,
    adminUserId: string,
    note?: string | null,
  ): Promise<PayoutSummary> {
    return this.request<PayoutSummary>(
      `/internal/admin/payments/${paymentId}/release`,
      'POST',
      {
        adminUserId,
        note: note ?? null,
      },
    );
  }

  listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    return this.request<PayoutEventSummary[]>(
      `/internal/admin/payments/payouts/${payoutId}/events`,
      'GET',
    );
  }

  recordPayoutEvent(
    payoutId: string,
    input: RecordPayoutEventRequest,
  ): Promise<PayoutEventSummary> {
    return this.request<PayoutEventSummary>(
      `/internal/admin/payments/payouts/${payoutId}/events`,
      'POST',
      input,
    );
  }

  listRefunds(status?: string | null): Promise<RefundSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<RefundSummary[]>(
      `/internal/admin/payments/refunds?${searchParams.toString()}`,
      'GET',
    );
  }

  approveRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    return this.request<RefundSummary>(
      `/internal/admin/payments/refunds/${refundId}/approve`,
      'POST',
      {
        adminUserId,
        reason: reason ?? null,
      },
    );
  }

  rejectRefund(
    refundId: string,
    adminUserId: string,
    reason: string,
  ): Promise<RefundSummary> {
    return this.request<RefundSummary>(
      `/internal/admin/payments/refunds/${refundId}/reject`,
      'POST',
      {
        adminUserId,
        reason,
      },
    );
  }

  listCommissionRules(): Promise<CommissionRuleSummary[]> {
    return this.request<CommissionRuleSummary[]>(
      '/internal/admin/payments/commission-rules',
      'GET',
    );
  }

  updateCommissionRule(
    ruleId: string,
    input: UpdateCommissionRuleRequest,
  ): Promise<CommissionRuleSummary> {
    return this.request<CommissionRuleSummary>(
      `/internal/admin/payments/commission-rules/${ruleId}`,
      'PATCH',
      input,
    );
  }

  listPricingRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.request<PricingCategoryRuleSummary[]>(
      '/internal/pricing/admin/rules',
      'GET',
    );
  }

  upsertPricingRule(
    input: UpsertPricingCategoryRuleRequest,
  ): Promise<PricingCategoryRuleSummary> {
    return this.request<PricingCategoryRuleSummary>(
      '/internal/pricing/admin/rules',
      'PUT',
      input,
    );
  }

  listPricingFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.request<PricingFuelIndexSummary[]>(
      '/internal/pricing/admin/fuel-index',
      'GET',
    );
  }

  createPricingFuelIndex(
    input: CreatePricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.request<PricingFuelIndexSummary>(
      '/internal/pricing/admin/fuel-index',
      'POST',
      input,
    );
  }

  syncPricingFuelIndexFromGasWatch(
    input: SyncPricingFuelIndexRequest,
  ): Promise<PricingFuelIndexSummary> {
    return this.request<PricingFuelIndexSummary>(
      '/internal/pricing/admin/fuel-index/sync',
      'POST',
      input,
    );
  }

  listPricingQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.request<PricingQuoteAuditSummary[]>(
      '/internal/pricing/admin/quote-audits',
      'GET',
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://localhost:8507',
    );
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'content-type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new Error('payment_dependency_unavailable');
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
      };
      if (payload.error?.code || payload.error?.message || response.status < 500) {
        throw new PaymentServiceRequestError(
          response.status,
          payload.error?.code ?? 'payment_request_failed',
          payload.error?.message ?? 'Payment service request failed.',
        );
      }
      throw new Error('payment_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
