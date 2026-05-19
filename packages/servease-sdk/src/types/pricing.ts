export type PricingMode = 'flat' | 'hourly';
export type PricingUrgency = 'standard' | 'priority' | 'emergency';
export type PricingFairnessStatus = 'below_range' | 'within_range' | 'above_range';
export type PricingConfidence = 'high' | 'medium' | 'low';

export interface PricingRouteLocation {
  latitude: number;
  longitude: number;
}

export interface CreatePricingQuoteRequest {
  providerId: string;
  serviceId: string;
  serviceAddress: string;
  scheduledAt: string;
  hoursRequired?: number | null;
  bookingUrgency?: PricingUrgency | null;
  region?: string | null;
  origin?: PricingRouteLocation | null;
  destination?: PricingRouteLocation | null;
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
  customerId?: string;
  providerId?: string;
  serviceId?: string;
  categoryId?: string | null;
  expiresAt?: string;
  currency?: 'PHP';
  estimatedTotal: number;
  fairRangeMin: number;
  fairRangeMax: number;
  fairnessStatus: PricingFairnessStatus;
  confidence: PricingConfidence;
  lineItems?: PricingQuoteLineItem[];
  signals?: PricingQuoteSignals;
  explanation: string;
  createdAt?: string | null;
}

export interface ProviderPricingGuidanceRequest {
  serviceId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  serviceTitle?: string | null;
  proposedPrice: number;
  pricingMode: PricingMode;
  estimatedHours?: number | null;
}

export type ProviderPricingGuidanceSummary = PricingQuoteSummary;
