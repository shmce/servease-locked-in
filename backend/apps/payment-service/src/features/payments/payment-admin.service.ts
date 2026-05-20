import { Injectable } from '@nestjs/common';
import { InvalidPaymentRequestError } from './payment.errors';
import {
  PaymentStatus,
  PaymentSummary,
  CommissionRuleStatus,
  CommissionRuleSummary,
  RefundStatus,
  RefundSummary,
  PromotionDiscountType,
  PromotionStatus,
  PromotionSummary,
  PayoutStatus,
  PayoutEventSummary,
  PayoutEventType,
  PayoutSummary,
  RecordPayoutEventInput,
  ReleasePaymentToProviderInput,
  UpsertPromotionInput,
} from './payment.types';
import { SharedPaymentService } from './shared-payment.service';
import { SupabasePaymentRepository } from './supabase-payment.repository';

const validStatuses = new Set(['pending', 'paid', 'cancelled', 'refunded']);
const validPayoutStatuses = new Set([
  'requested',
  'processing',
  'paid',
  'cancelled',
]);
const validPayoutEventTypes = new Set<PayoutEventType>([
  'requested',
  'approved',
  'rejected',
  'status_updated',
  'bank_reference_reconciled',
]);
const validPromotionStatuses = new Set([
  'active',
  'scheduled',
  'expired',
  'disabled',
]);
const validPromotionDiscountTypes = new Set(['percent', 'fixed']);
const validRefundStatuses = new Set([
  'requested',
  'approved',
  'processed',
  'rejected',
]);
const validCommissionRuleStatuses = new Set(['active', 'pending', 'inactive']);

@Injectable()
export class PaymentAdminService {
  constructor(
    private readonly paymentRepository: SupabasePaymentRepository,
    private readonly sharedPaymentService?: SharedPaymentService,
  ) {}

  async getPayment(paymentId: string): Promise<PaymentSummary> {
    if (!paymentId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.adminGetPayment(paymentId);
  }

  async listPayments(status?: string | null): Promise<PaymentSummary[]> {
    if (status && !validStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listAllPayments(
      (status as PaymentStatus | undefined) ?? null,
    );
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    if (!paymentId || !validStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.updatePaymentStatus(
      paymentId,
      status as PaymentStatus,
    );
  }

  async recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    if (!paymentId || !failureReason || !failureReason.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.recordPaymentFailure(
      paymentId,
      failureReason.trim(),
      failureCode ? failureCode.trim() : null,
      disputeId ?? null,
    );
  }

  async retryPayment(paymentId: string): Promise<PaymentSummary> {
    if (!paymentId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.retryPayment(paymentId);
  }

  async syncPaymentWithApicenter(paymentId: string): Promise<PaymentSummary> {
    const normalizedPaymentId = paymentId?.trim();
    if (!normalizedPaymentId) {
      throw new InvalidPaymentRequestError();
    }

    if (!this.sharedPaymentService) {
      throw new Error('shared_payment_service_unavailable');
    }

    const checkoutId =
      await this.paymentRepository.getLatestApicenterCheckoutId(normalizedPaymentId);
    await this.sharedPaymentService.getCheckoutStatus(checkoutId);

    return this.paymentRepository.adminGetPayment(normalizedPaymentId);
  }

  async listPromotions(status?: string | null): Promise<PromotionSummary[]> {
    if (status && !validPromotionStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listPromotions(
      (status as PromotionStatus | undefined) ?? null,
    );
  }

  async upsertPromotion(input: UpsertPromotionInput): Promise<PromotionSummary> {
    if (
      !input.code?.trim() ||
      !validPromotionDiscountTypes.has(input.discountType) ||
      !Number.isFinite(input.discountValue) ||
      input.discountValue <= 0 ||
      !Number.isFinite(input.minOrderAmount ?? 0) ||
      (input.minOrderAmount ?? 0) < 0
    ) {
      throw new InvalidPaymentRequestError();
    }

    if (
      input.maxDiscountAmount !== null &&
      input.maxDiscountAmount !== undefined &&
      (!Number.isFinite(input.maxDiscountAmount) || input.maxDiscountAmount <= 0)
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.upsertPromotion({
      ...input,
      code: input.code.trim().toUpperCase(),
      description: input.description?.trim() || null,
      discountType: input.discountType as PromotionDiscountType,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      minOrderAmount: input.minOrderAmount ?? 0,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      isActive: input.isActive ?? true,
    });
  }

  async deletePromotion(promotionId: string): Promise<PromotionSummary> {
    if (!promotionId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.deletePromotion(promotionId);
  }

  async listPayouts(status?: string | null): Promise<PayoutSummary[]> {
    if (status && !validPayoutStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listAllPayouts(
      (status as PayoutStatus | undefined) ?? null,
    );
  }

  async updatePayoutStatus(
    payoutId: string,
    status: string,
  ): Promise<PayoutSummary> {
    if (!payoutId || !validPayoutStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.updatePayoutStatus(
      payoutId,
      status as PayoutStatus,
    );
  }

  async releasePaymentToProvider(
    input: ReleasePaymentToProviderInput,
  ): Promise<PayoutSummary> {
    if (!input.paymentId?.trim() || !input.adminUserId?.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.releasePaymentToProvider({
      paymentId: input.paymentId.trim(),
      adminUserId: input.adminUserId.trim(),
      note: input.note?.trim() || null,
    });
  }

  async listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    if (!payoutId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listPayoutEvents(payoutId);
  }

  async recordPayoutEvent(
    input: RecordPayoutEventInput,
  ): Promise<PayoutEventSummary> {
    if (
      !input.payoutId ||
      !validPayoutEventTypes.has(input.eventType) ||
      !validPayoutStatuses.has(input.status)
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.recordPayoutEvent({
      ...input,
      bankReference: input.bankReference?.trim() || null,
      note: input.note?.trim() || null,
      adminUserId: input.adminUserId?.trim() || null,
    });
  }

  async listRefunds(status?: string | null): Promise<RefundSummary[]> {
    if (status && !validRefundStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listRefunds(
      (status as RefundStatus | undefined) ?? null,
    );
  }

  async approveRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    if (!refundId || !adminUserId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.decideRefund(
      refundId,
      adminUserId,
      'approved',
      reason?.trim() || null,
    );
  }

  async rejectRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    if (!refundId || !adminUserId || !reason?.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.decideRefund(
      refundId,
      adminUserId,
      'rejected',
      reason.trim(),
    );
  }

  listCommissionRules(): Promise<CommissionRuleSummary[]> {
    return this.paymentRepository.listCommissionRules();
  }

  async updateCommissionRule(input: {
    ruleId: string;
    currentRate: number;
    status?: string | null;
    adminUserId: string;
  }): Promise<CommissionRuleSummary> {
    const status = input.status ?? 'active';
    if (
      !input.ruleId?.trim() ||
      !input.adminUserId ||
      !Number.isFinite(input.currentRate) ||
      input.currentRate < 0 ||
      input.currentRate > 100 ||
      !validCommissionRuleStatuses.has(status)
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.updateCommissionRule({
      ruleId: input.ruleId.trim(),
      currentRate: input.currentRate,
      status: status as CommissionRuleStatus,
      adminUserId: input.adminUserId,
    });
  }
}
