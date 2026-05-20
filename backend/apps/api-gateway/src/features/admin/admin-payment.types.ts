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
  apicenterCheckoutId: string | null;
  apicenterCheckoutStatus: string | null;
  apicenterProvider: string | null;
  apicenterProviderMode: string | null;
}

export interface RecordPaymentFailureRequest {
  failureReason: string;
  failureCode?: string | null;
  disputeId?: string | null;
}

export interface PayoutSummary {
  id: string;
  paymentId: string | null;
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

export type PricingMode = 'flat' | 'hourly';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';

export interface PricingCategoryRuleSummary {
  id: string;
  categoryId: string | null;
  categoryName: string;
  pricingMode: PricingMode | 'any';
  baselineMin: number;
  baselineMax: number;
  fairBandPercent: number;
  travelFeeMin: number;
  travelFeeMax: number;
  travelMultiplier: number;
  travelTimeFeePerMinute: number;
  urgencyPriorityMultiplier: number;
  urgencyEmergencyMultiplier: number;
  outlierWarnPercent: number;
  isActive: boolean;
  updatedAt: string | null;
}

export interface UpsertPricingCategoryRuleRequest {
  ruleId?: string | null;
  categoryId?: string | null;
  categoryName: string;
  pricingMode?: PricingMode | 'any' | null;
  baselineMin: number;
  baselineMax: number;
  fairBandPercent?: number | null;
  travelFeeMin?: number | null;
  travelFeeMax?: number | null;
  travelMultiplier?: number | null;
  travelTimeFeePerMinute?: number | null;
  urgencyPriorityMultiplier?: number | null;
  urgencyEmergencyMultiplier?: number | null;
  outlierWarnPercent?: number | null;
  isActive?: boolean | null;
  adminUserId: string;
}

export interface PricingFuelIndexSummary {
  id: string;
  region: string;
  fuelPricePerLiter: number;
  source: string | null;
  effectiveAt: string;
  createdBy: string | null;
  createdAt: string | null;
}

export interface CreatePricingFuelIndexRequest {
  region: string;
  fuelPricePerLiter: number;
  source?: string | null;
  effectiveAt?: string | null;
  adminUserId: string;
}

export interface SyncPricingFuelIndexRequest {
  adminUserId: string;
  region?: string | null;
}

export interface PricingQuoteAuditSummary {
  quoteId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  categoryId: string | null;
  estimatedTotal: number;
  fairRangeMin: number;
  fairRangeMax: number;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  expiresAt: string;
  createdAt: string | null;
}
