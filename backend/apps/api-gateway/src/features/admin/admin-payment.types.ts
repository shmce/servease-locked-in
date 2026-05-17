export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';
export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'cancelled';
export type PayoutEventType =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'status_updated'
  | 'bank_reference_reconciled';
export type PromotionDiscountType = 'percent' | 'fixed';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled';
export type RefundStatus = 'requested' | 'approved' | 'processed' | 'rejected';
export type CommissionRuleStatus = 'active' | 'pending' | 'inactive';

export interface PaymentSummary {
  id: string;
  bookingId: string;
  customerId: string | null;
  providerId: string | null;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string | null;
  failureReason: string | null;
  failureCode: string | null;
  retryCount: number;
  lastRetryAt: string | null;
  disputeId: string | null;
}

export interface RecordPaymentFailureRequest {
  failureReason: string;
  failureCode?: string | null;
  disputeId?: string | null;
}

export interface PayoutSummary {
  id: string;
  providerId: string;
  amount: number;
  processingFee: number;
  netAmount: number;
  status: PayoutStatus;
  payoutMethodId: string | null;
  methodType: string | null;
  accountLabel: string | null;
  reference: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  requestedAt: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface PayoutEventSummary {
  id: string;
  payoutId: string;
  eventType: PayoutEventType;
  status: PayoutStatus;
  bankReference: string | null;
  note: string | null;
  adminUserId: string | null;
  createdAt: string | null;
}

export interface RecordPayoutEventRequest {
  eventType: PayoutEventType;
  status: PayoutStatus;
  bankReference?: string | null;
  note?: string | null;
  adminUserId?: string | null;
}

export interface RefundSummary {
  id: string;
  paymentId: string;
  bookingId: string;
  customerId: string | null;
  providerId: string | null;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string | null;
  decidedBy: string | null;
  decisionReason: string | null;
  decidedAt: string | null;
  processedAt: string | null;
  createdAt: string | null;
}

export interface CommissionRuleSummary {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  currentRate: number;
  previousRate: number;
  status: CommissionRuleStatus;
  monthlyRevenue: number;
  monthlyCommission: number;
  updatedBy: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface UpdateCommissionRuleRequest {
  currentRate: number;
  status?: CommissionRuleStatus | null;
  adminUserId: string;
}

export interface PromotionSummary {
  id: string;
  code: string;
  description: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  status: PromotionStatus;
  createdAt: string | null;
}

export interface UpsertPromotionRequest {
  code: string;
  description?: string | null;
  discountType: PromotionDiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean | null;
}
