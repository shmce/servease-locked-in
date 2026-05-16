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
  PayoutSummary,
  UpsertPromotionInput,
} from './payment.types';
import { SupabasePaymentRepository } from './supabase-payment.repository';

const validStatuses = new Set(['pending', 'paid', 'cancelled', 'refunded']);
const validPayoutStatuses = new Set([
  'requested',
  'processing',
  'paid',
  'cancelled',
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
  constructor(private readonly paymentRepository: SupabasePaymentRepository) {}

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
