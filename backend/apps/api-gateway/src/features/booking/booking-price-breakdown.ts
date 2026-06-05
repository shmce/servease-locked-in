import { BookingPriceBreakdown, BookingPricingMode } from './booking.types';

export interface BookingPriceBreakdownRouteInput {
  distanceMeters?: number | null;
  durationSeconds?: number | null;
}

export interface BookingPriceBreakdownConfig {
  fallbackTravelFee: number;
  baseTravelFee: number;
  perKilometerTravelFee: number;
  perMinuteTravelFee: number;
  minTravelFee: number;
  maxTravelFee: number;
  serviceFeePercent: number;
  minServiceFee: number;
}

export interface BuildBookingPriceBreakdownInput {
  serviceRate?: number | null;
  pricingMode?: BookingPricingMode | null;
  hoursRequired?: number | null;
  route?: BookingPriceBreakdownRouteInput | null;
  fallbackReason?: string | null;
  generatedAt?: string;
  config?: Partial<BookingPriceBreakdownConfig>;
}

const DEFAULT_PRICE_BREAKDOWN_CONFIG: BookingPriceBreakdownConfig = {
  fallbackTravelFee: 120,
  baseTravelFee: 50,
  perKilometerTravelFee: 20,
  perMinuteTravelFee: 2,
  minTravelFee: 80,
  maxTravelFee: 500,
  serviceFeePercent: 0.05,
  minServiceFee: 25,
};

export function buildBookingPriceBreakdown(
  input: BuildBookingPriceBreakdownInput,
): BookingPriceBreakdown {
  const config = {
    ...DEFAULT_PRICE_BREAKDOWN_CONFIG,
    ...input.config,
  };
  const pricingMode = input.pricingMode === 'hourly' ? 'hourly' : 'flat';
  const hoursRequired = normalizeHours(input.hoursRequired);
  const serviceRate = roundMoney(Math.max(0, Number(input.serviceRate ?? 0)));
  const serviceSubtotal = roundMoney(
    pricingMode === 'hourly' ? serviceRate * hoursRequired : serviceRate,
  );
  const route = normalizeRoute(input.route);
  const travelFee = route
    ? clampMoney(
        config.baseTravelFee +
          route.distanceKm * config.perKilometerTravelFee +
          route.durationMinutes * config.perMinuteTravelFee,
        config.minTravelFee,
        config.maxTravelFee,
      )
    : roundMoney(config.fallbackTravelFee);
  const serviceFeeBase = serviceSubtotal + travelFee;
  const serviceFee =
    serviceFeeBase > 0
      ? roundMoney(
          Math.max(
            config.minServiceFee,
            serviceFeeBase * config.serviceFeePercent,
          ),
        )
      : 0;
  const total = roundMoney(serviceSubtotal + travelFee + serviceFee);
  const fallbackUsed = route === null;

  return {
    currency: 'PHP',
    lineItems: [
      {
        code: 'service_subtotal',
        label: 'Service subtotal',
        amount: serviceSubtotal,
        source: 'provider_rate',
      },
      {
        code: 'travel_fuel',
        label: fallbackUsed ? 'Travel and fuel estimate' : 'Travel and fuel',
        amount: travelFee,
        source: fallbackUsed ? 'fallback' : 'route',
      },
      {
        code: 'service_fee',
        label: 'Platform fee',
        amount: serviceFee,
        source: 'platform_fee',
      },
    ],
    serviceSubtotal,
    travelFee,
    serviceFee,
    total,
    fallbackUsed,
    calculationSource: fallbackUsed ? 'fallback' : 'route',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    metadata: {
      pricingMode,
      hoursRequired,
      serviceRate,
      distanceKm: route?.distanceKm ?? null,
      durationMinutes: route?.durationMinutes ?? null,
      fallbackReason: fallbackUsed
        ? (input.fallbackReason ?? 'route_unavailable')
        : null,
    },
  };
}

function normalizeHours(value: number | null | undefined): number {
  const hours = Number(value ?? 1);
  return Number.isFinite(hours) && hours > 0 ? hours : 1;
}

function normalizeRoute(
  route: BookingPriceBreakdownRouteInput | null | undefined,
): { distanceKm: number; durationMinutes: number } | null {
  if (!route) {
    return null;
  }

  const distanceMeters = Number(route.distanceMeters);
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return null;
  }

  const durationSeconds = Number(route.durationSeconds ?? 0);
  return {
    distanceKm: roundMoney(distanceMeters / 1000),
    durationMinutes:
      Number.isFinite(durationSeconds) && durationSeconds > 0
        ? roundMoney(durationSeconds / 60)
        : 0,
  };
}

function clampMoney(value: number, min: number, max: number): number {
  return roundMoney(Math.min(Math.max(value, min), max));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
