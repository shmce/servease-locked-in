export type PricingMode = 'flat' | 'hourly';
export type PricingUrgency = 'standard' | 'priority' | 'emergency';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';

export interface PricingRouteLocation {
  latitude: number;
  longitude: number;
}

export interface CreatePricingQuoteRequest {
  providerId?: string;
  serviceId?: string;
  serviceAddress?: string;
  scheduledAt?: string;
  hoursRequired?: number | null;
  bookingUrgency?: PricingUrgency | null;
  region?: string | null;
  origin?: PricingRouteLocation | null;
  destination?: PricingRouteLocation | null;
}

export interface InternalCreatePricingQuoteRequest {
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

export interface PricingFuelIndexSummary {
  id: string;
  region: string;
  fuelPricePerLiter: number;
  source: string | null;
  effectiveAt: string;
  createdBy: string | null;
  createdAt: string | null;
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

export interface UpsertPricingCategoryRuleRequest {
  ruleId?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  pricingMode?: PricingMode | 'any' | null;
  baselineMin?: number;
  baselineMax?: number;
  fairBandPercent?: number | null;
  travelFeeMin?: number | null;
  travelFeeMax?: number | null;
  travelMultiplier?: number | null;
  travelTimeFeePerMinute?: number | null;
  urgencyPriorityMultiplier?: number | null;
  urgencyEmergencyMultiplier?: number | null;
  outlierWarnPercent?: number | null;
  isActive?: boolean | null;
}

export interface CreatePricingFuelIndexRequest {
  region?: string;
  fuelPricePerLiter?: number;
  source?: string | null;
  effectiveAt?: string | null;
}
