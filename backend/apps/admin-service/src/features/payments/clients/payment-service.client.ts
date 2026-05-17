import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentSummary,
  CommissionRuleSummary,
  PayoutEventSummary,
  PromotionSummary,
  PayoutSummary,
  RecordPayoutEventRequest,
  RefundSummary,
  UpsertPromotionRequest,
  UpdateCommissionRuleRequest,
} from '../admin-payment.types';

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

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'PATCH' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://localhost:8507',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('payment_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
