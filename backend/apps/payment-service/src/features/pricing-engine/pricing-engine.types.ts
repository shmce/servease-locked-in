export type PricingMode = 'flat' | 'hourly';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';
export type PricingUrgency = 'standard' | 'priority' | 'emergency';
export type PricingFuelSyncFuelType = 'average' | 'diesel' | 'unleaded';

export interface PricingQuoteLineItem {
  code: 'labor' | 'travel_fuel' | 'urgency' | 'adjustment';
  label: string;
  amount: number;
}

export interface PricingQuoteSignals {
  distanceKm: number | null;
  durationMinutes: number | null;
  fuelPricePerLiter: number;
  fuelIndexUpdatedAt: string | null;
  staleFuelIndex: boolean;
  fallbackUsed: boolean;
}

export interface CreatePricingQuoteInput {
  customerId: string;
  providerId: string;
  serviceId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  serviceTitle?: string | null;
  providerBasePrice: number;
  pricingMode: PricingMode;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  bookingUrgency?: PricingUrgency | null;
  distanceKm?: number | null;
  durationMinutes?: number | null;
  region?: string | null;
}

export interface PricingQuoteSummary {
  quoteId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  categoryId: string | null;
  expiresAt: string;
  currency: 'PHP';
  estimatedTotal: number;
  fairRangeMin: number;
  fairRangeMax: number;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  lineItems: PricingQuoteLineItem[];
  signals: PricingQuoteSignals;
  explanation: string;
  createdAt: string | null;
}

export interface PricingQuoteValidationResult {
  quoteId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  amount: number;
  pricingMode: PricingMode;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  expiresAt: string;
}

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

export interface UpsertPricingCategoryRuleInput {
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

export interface CreatePricingFuelIndexInput {
  region: string;
  fuelPricePerLiter: number;
  source?: string | null;
  effectiveAt?: string | null;
  adminUserId?: string | null;
}

export interface SyncPricingFuelIndexInput {
  adminUserId?: string | null;
  region?: string | null;
}

export interface PricingFuelPriceCandidate {
  region: string;
  fuelType: PricingFuelSyncFuelType;
  pricePerLiter: number;
  source: string;
  effectiveAt: string;
}

export interface PricingFuelPriceProvider {
  getLatestFuelPrice(): Promise<PricingFuelPriceCandidate>;
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
