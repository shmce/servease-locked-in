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
  apicenterCheckoutId: string | null;
  apicenterCheckoutStatus: string | null;
  apicenterProvider: string | null;
  apicenterProviderMode: string | null;
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

export interface ConfirmCashOnServicePaymentInput {
  bookingId: string;
  providerId?: string | null;
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
export type PayoutEventType =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'status_updated'
  | 'bank_reference_reconciled';
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

export interface RecordPayoutEventInput {
  payoutId: string;
  eventType: PayoutEventType;
  status: PayoutStatus;
  bankReference?: string | null;
  note?: string | null;
  adminUserId?: string | null;
}

export interface ReleasePaymentToProviderInput {
  paymentId: string;
  adminUserId: string;
  note?: string | null;
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

export type PaymentProvider = 'paymongo' | 'mock';

export type SharedPaymentMethod =
  | 'qrph'
  | 'gcash'
  | 'grab_pay'
  | 'grabpay'
  | 'paymaya'
  | 'maya'
  | 'card'
  | 'visa'
  | 'mastercard'
  | 'dob'
  | 'brankas'
  | 'direct_online_banking'
  | 'online_banking';

export interface SharedPaymentAmount {
  value: number;
  currency: string;
}

export interface SharedPaymentLineItem {
  name: string;
  quantity: number;
  amount: SharedPaymentAmount;
}

export interface SharedPaymentCustomerInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateCheckoutSessionInput {
  referenceId: string;
  idempotencyKey?: string | null;
  mode?: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  lineItems: SharedPaymentLineItem[];
  customerId?: string | null;
  priceId?: string | null;
  paymentMethods?: SharedPaymentMethod[];
  customer?: SharedPaymentCustomerInput;
  metadata?: Record<string, string>;
  localPayment?: LocalCheckoutPaymentInput;
}

export interface PaymentCheckoutSessionSummary {
  checkoutId: string;
  provider: PaymentProvider;
  providerMode?: 'test' | 'live';
  status:
    | 'created'
    | 'pending'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'refunded'
    | 'partially_refunded';
  referenceId: string;
  redirectUrl: string;
  expiresAt?: string;
  amount?: SharedPaymentAmount;
  currency?: string;
  paymentMethodsAllowed?: string[];
  metadata?: Record<string, string>;
  paymentId?: string;
  bookingId?: string;
  localPaymentStatus?: PaymentStatus;
  paidAt?: string | null;
}

export type ApicenterCheckoutWebhookInput = Pick<
  PaymentCheckoutSessionSummary,
  | 'checkoutId'
  | 'provider'
  | 'providerMode'
  | 'status'
  | 'referenceId'
  | 'redirectUrl'
  | 'expiresAt'
  | 'amount'
  | 'currency'
  | 'paymentMethodsAllowed'
  | 'metadata'
>;

export interface LocalCheckoutPaymentInput {
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  paymentMethod: string;
}

export interface ApicenterCheckoutSyncSummary {
  paymentId: string;
  bookingId: string;
  localPaymentStatus: PaymentStatus;
  paidAt: string | null;
}

export interface RecordApicenterCheckoutInput extends LocalCheckoutPaymentInput {
  session: PaymentCheckoutSessionSummary;
}

export interface CreatePaymentRefundInput {
  paymentId: string;
  amount: SharedPaymentAmount;
  idempotencyKey?: string | null;
  reason?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, string>;
}

export interface PaymentRefundSummary {
  refundId: string;
  paymentId: string;
  provider: PaymentProvider;
  status: 'pending' | 'succeeded' | 'failed';
  amount: SharedPaymentAmount;
  reason?: string;
  referenceId?: string;
}

export interface CreatePaymentCustomerInput {
  idempotencyKey?: string | null;
  customerId?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  metadata?: Record<string, string>;
}

export interface PaymentCustomerSummary {
  customerId: string;
  provider: PaymentProvider;
  providerMode?: 'test' | 'live';
  email?: string;
  phone?: string;
  name?: string;
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentProductInput {
  idempotencyKey?: string | null;
  productId?: string | null;
  name: string;
  description?: string | null;
  metadata?: Record<string, string>;
}

export interface PaymentProductSummary {
  productId: string;
  provider?: PaymentProvider;
  providerMode?: 'test' | 'live';
  name: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string>;
}

export interface CreatePaymentPriceInput {
  idempotencyKey?: string | null;
  priceId?: string | null;
  productId: string;
  amount: SharedPaymentAmount;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialPeriodDays?: number;
  };
  metadata?: Record<string, string>;
}

export interface PaymentPriceSummary {
  priceId: string;
  provider?: PaymentProvider;
  providerMode?: 'test' | 'live';
  productId: string;
  amount: SharedPaymentAmount;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialPeriodDays?: number;
  };
  active: boolean;
  metadata?: Record<string, string>;
}

export interface CreatePaymentSubscriptionInput {
  subscriptionId?: string | null;
  referenceId: string;
  idempotencyKey?: string | null;
  customerId: string;
  priceId: string;
  successUrl?: string | null;
  cancelUrl?: string | null;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface PaymentSubscriptionSummary {
  subscriptionId: string;
  provider: PaymentProvider;
  providerMode?: 'test' | 'live';
  referenceId: string;
  customerId: string;
  priceId: string;
  status:
    | 'incomplete'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'paused'
    | 'cancelled'
    | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  latestInvoiceId?: string;
  latestPaymentId?: string;
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentInvoiceSummary {
  invoiceId: string;
  provider: PaymentProvider;
  providerMode?: 'test' | 'live';
  subscriptionId?: string;
  customerId?: string;
  status: 'draft' | 'open' | 'paid' | 'failed' | 'void' | 'uncollectible';
  amountDue?: SharedPaymentAmount;
  amountPaid?: SharedPaymentAmount;
  dueAt?: string;
  paidAt?: string;
  metadata?: Record<string, string>;
}
