export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

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

export interface RecordPaymentFailureInput {
  failureReason: string;
  failureCode?: string | null;
  disputeId?: string | null;
}

export interface PaymentVisibility {
  customerId: string | null;
  providerId: string | null;
}

export interface CreatePaymentInput {
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  paymentMethod: string;
}

export interface PromotionValidationSummary {
  code: string;
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export type PromotionDiscountType = 'percent' | 'fixed';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled';
export type RefundStatus = 'requested' | 'approved' | 'processed' | 'rejected';
export type CommissionRuleStatus = 'active' | 'pending' | 'inactive';

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

export interface UpsertPromotionInput {
  promotionId?: string | null;
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

export type PayoutMethodType = 'bank' | 'gcash' | 'paymaya';
export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'cancelled';
export type CustomerPaymentMethodType =
  | 'cash_on_service'
  | 'card'
  | 'gcash'
  | 'paymaya';

export interface CustomerPaymentMethodSummary {
  id: string;
  customerId: string;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand: string | null;
  last4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertCustomerPaymentMethodInput {
  customerId: string;
  methodId?: string | null;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean | null;
}

export interface PayoutMethodSummary {
  id: string;
  providerId: string;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName: string | null;
  accountNumberLast4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertPayoutMethodInput {
  providerId: string;
  methodId?: string | null;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName?: string | null;
  accountNumberLast4?: string | null;
  isDefault?: boolean | null;
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

export interface PayoutAccountSummary {
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
  nextPayoutDate: string | null;
}

export interface CreatePayoutRequestInput {
  providerId: string;
  userId: string;
  amount: number;
  payoutMethodId: string;
  idempotencyKey?: string | null;
}
