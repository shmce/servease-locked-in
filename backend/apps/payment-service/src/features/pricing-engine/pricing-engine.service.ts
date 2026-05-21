import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  InvalidPricingQuoteRequestError,
  InvalidPricingRuleRequestError,
  PricingFuelSyncUnavailableError,
  PricingQuoteExpiredError,
} from './pricing-engine.errors';
import { GasWatchFuelPriceProvider } from './gaswatch-fuel-price.provider';
import { PricingEngineRepository } from './pricing-engine.repository';
import {
  CreatePricingFuelIndexInput,
  CreatePricingQuoteInput,
  PricingCategoryRuleSummary,
  PricingConfidence,
  PricingFairnessStatus,
  PricingFuelIndexSummary,
  PricingQuoteAuditSummary,
  PricingQuoteLineItem,
  PricingQuoteSignals,
  PricingQuoteSummary,
  PricingQuoteValidationResult,
  PricingFuelPriceCandidate,
  PricingFuelPriceProvider,
  SyncPricingFuelIndexInput,
  UpsertPricingCategoryRuleInput,
} from './pricing-engine.types';

const DEFAULT_RULE: PricingCategoryRuleSummary = {
  id: 'default',
  categoryId: null,
  categoryName: 'Default services',
  pricingMode: 'any',
  baselineMin: 300,
  baselineMax: 5000,
  fairBandPercent: 15,
  travelFeeMin: 0,
  travelFeeMax: 500,
  travelMultiplier: 1.2,
  travelTimeFeePerMinute: 2,
  urgencyPriorityMultiplier: 0.1,
  urgencyEmergencyMultiplier: 0.25,
  outlierWarnPercent: 20,
  isActive: true,
  updatedAt: null,
};

@Injectable()
export class PricingEngineService {
  constructor(
    private readonly pricingRepository: PricingEngineRepository,
    @Optional()
    @Inject(GasWatchFuelPriceProvider)
    private readonly fuelPriceProvider: PricingFuelPriceProvider =
      new GasWatchFuelPriceProvider(),
  ) {}

  async createQuote(input: CreatePricingQuoteInput): Promise<PricingQuoteSummary> {
    this.assertValidQuoteInput(input);

    const [rules, fuelIndexes] = await Promise.all([
      this.pricingRepository.listRules(),
      this.pricingRepository.listFuelIndex(),
    ]);
    const rule = this.selectRule(rules, input);
    const fuelIndex = this.selectFuelIndex(fuelIndexes, input.region ?? 'default');
    const quote = this.calculateQuote(input, rule, fuelIndex);

    return this.pricingRepository.createQuote(quote);
  }

  async validateQuote(
    quoteId: string,
  ): Promise<PricingQuoteValidationResult> {
    if (!quoteId?.trim()) {
      throw new InvalidPricingQuoteRequestError();
    }

    const quote = await this.pricingRepository.validateQuote(quoteId.trim());
    if (new Date(quote.expiresAt).getTime() <= Date.now()) {
      throw new PricingQuoteExpiredError();
    }

    return quote;
  }

  listRules(): Promise<PricingCategoryRuleSummary[]> {
    return this.pricingRepository.listRules();
  }

  upsertRule(
    input: UpsertPricingCategoryRuleInput,
  ): Promise<PricingCategoryRuleSummary> {
    if (
      !input.categoryName?.trim() ||
      !Number.isFinite(input.baselineMin) ||
      !Number.isFinite(input.baselineMax) ||
      input.baselineMin < 0 ||
      input.baselineMax < input.baselineMin ||
      !input.adminUserId
    ) {
      throw new InvalidPricingRuleRequestError();
    }

    return this.pricingRepository.upsertRule({
      ...input,
      categoryName: input.categoryName.trim(),
      pricingMode: input.pricingMode ?? 'any',
    });
  }

  listFuelIndex(): Promise<PricingFuelIndexSummary[]> {
    return this.pricingRepository.listFuelIndex();
  }

  createFuelIndex(
    input: CreatePricingFuelIndexInput,
  ): Promise<PricingFuelIndexSummary> {
    if (
      !input.region?.trim() ||
      !Number.isFinite(input.fuelPricePerLiter) ||
      input.fuelPricePerLiter <= 0 ||
      !input.adminUserId
    ) {
      throw new InvalidPricingRuleRequestError();
    }

    return this.pricingRepository.createFuelIndex({
      ...input,
      region: input.region.trim().toLowerCase(),
      source: input.source?.trim() || 'admin',
    });
  }

  async syncFuelIndexFromGasWatch(
    input: SyncPricingFuelIndexInput = {},
  ): Promise<PricingFuelIndexSummary> {
    const candidate = await this.getGasWatchFuelPrice();
    const region = (input.region ?? candidate.region ?? 'default')
      .trim()
      .toLowerCase();

    if (!region || !this.isValidSyncedFuelPrice(candidate)) {
      throw new PricingFuelSyncUnavailableError();
    }

    const existing = await this.findExistingFuelIndexSnapshot(
      region,
      candidate,
    );
    if (existing) {
      return existing;
    }

    return this.pricingRepository.createFuelIndex({
      region,
      fuelPricePerLiter: candidate.pricePerLiter,
      source: candidate.source,
      effectiveAt: candidate.effectiveAt,
      adminUserId: input.adminUserId ?? null,
    });
  }

  listQuoteAudits(): Promise<PricingQuoteAuditSummary[]> {
    return this.pricingRepository.listQuoteAudits();
  }

  private async getGasWatchFuelPrice(): Promise<PricingFuelPriceCandidate> {
    try {
      return await this.fuelPriceProvider.getLatestFuelPrice();
    } catch {
      throw new PricingFuelSyncUnavailableError();
    }
  }

  private async findExistingFuelIndexSnapshot(
    region: string,
    candidate: PricingFuelPriceCandidate,
  ): Promise<PricingFuelIndexSummary | null> {
    const rows = await this.pricingRepository.listFuelIndex();
    return (
      rows.find(
        (row) =>
          row.region.toLowerCase() === region &&
          row.source === candidate.source &&
          row.effectiveAt === candidate.effectiveAt &&
          row.fuelPricePerLiter === candidate.pricePerLiter,
      ) ?? null
    );
  }

  private isValidSyncedFuelPrice(candidate: PricingFuelPriceCandidate): boolean {
    return (
      Number.isFinite(candidate.pricePerLiter) &&
      candidate.pricePerLiter >= 20 &&
      candidate.pricePerLiter <= 250 &&
      Boolean(candidate.source?.trim()) &&
      Number.isFinite(new Date(candidate.effectiveAt).getTime())
    );
  }

  private calculateQuote(
    input: CreatePricingQuoteInput,
    rule: PricingCategoryRuleSummary,
    fuelIndex: PricingFuelIndexSummary | null,
  ): Omit<PricingQuoteSummary, 'quoteId' | 'createdAt'> {
    const hours = Math.max(1, Math.ceil(input.hoursRequired ?? 1));
    const distanceKm = this.nonNegativeOrNull(input.distanceKm);
    const durationMinutes = this.nonNegativeOrNull(input.durationMinutes);
    const fuelPricePerLiter = fuelIndex?.fuelPricePerLiter ?? this.defaultFuelPrice();
    const staleFuelIndex = this.isStaleFuelIndex(fuelIndex);
    const fallbackUsed = distanceKm === null;
    const rawLabor =
      input.pricingMode === 'hourly'
        ? input.providerBasePrice * hours
        : input.providerBasePrice;
    const laborSubtotal = this.clamp(
      rawLabor,
      rule.baselineMin,
      Math.max(rule.baselineMax, rule.baselineMin),
    );
    const fuelCost =
      distanceKm === null
        ? this.defaultTravelFee()
        : (distanceKm / this.vehicleEfficiencyKmPerLiter()) * fuelPricePerLiter;
    const travelTimeFee = (durationMinutes ?? 0) * rule.travelTimeFeePerMinute;
    const travelSubtotal = this.clamp(
      fuelCost * rule.travelMultiplier + travelTimeFee,
      rule.travelFeeMin,
      rule.travelFeeMax,
    );
    const urgencyMultiplier = this.urgencyMultiplier(input, rule);
    const urgencyAdjustment = laborSubtotal * urgencyMultiplier;
    const estimatedTotal = this.roundPeso(
      laborSubtotal + travelSubtotal + urgencyAdjustment,
    );
    const fairBandAmount = estimatedTotal * (rule.fairBandPercent / 100);
    const fairRangeMin = this.roundPeso(Math.max(0, estimatedTotal - fairBandAmount));
    const fairRangeMax = this.roundPeso(estimatedTotal + fairBandAmount);
    const fairnessStatus = this.fairnessStatus(
      rawLabor + travelSubtotal + urgencyAdjustment,
      fairRangeMin,
      fairRangeMax,
      rule.outlierWarnPercent,
    );
    const confidence = this.confidence(fallbackUsed, staleFuelIndex, input);
    const lineItems: PricingQuoteLineItem[] = [
      { code: 'labor', label: 'Labor', amount: this.roundPeso(laborSubtotal) },
      {
        code: 'travel_fuel',
        label: fallbackUsed ? 'Travel and fuel estimate' : 'Travel and fuel',
        amount: this.roundPeso(travelSubtotal),
      },
    ];

    if (urgencyAdjustment > 0) {
      lineItems.push({
        code: 'urgency',
        label: 'Urgency adjustment',
        amount: this.roundPeso(urgencyAdjustment),
      });
    }

    const signals: PricingQuoteSignals = {
      distanceKm,
      durationMinutes,
      fuelPricePerLiter,
      fuelIndexUpdatedAt: fuelIndex?.effectiveAt ?? null,
      staleFuelIndex,
      fallbackUsed,
    };

    return {
      customerId: input.customerId,
      providerId: input.providerId,
      serviceId: input.serviceId,
      categoryId: input.categoryId ?? null,
      expiresAt: new Date(
        Date.now() + this.quoteTtlSeconds() * 1000,
      ).toISOString(),
      currency: 'PHP',
      estimatedTotal,
      fairRangeMin,
      fairRangeMax,
      fairnessStatus,
      confidence,
      lineItems,
      signals,
      explanation: this.explanation(
        fairnessStatus,
        confidence,
        input.categoryName ?? rule.categoryName,
      ),
    };
  }

  private assertValidQuoteInput(input: CreatePricingQuoteInput): void {
    if (
      !input.customerId ||
      !input.providerId ||
      !input.serviceId ||
      !input.serviceAddress?.trim() ||
      !input.scheduledAt ||
      !Number.isFinite(input.providerBasePrice) ||
      input.providerBasePrice <= 0 ||
      !['flat', 'hourly'].includes(input.pricingMode) ||
      (input.hoursRequired !== null &&
        input.hoursRequired !== undefined &&
        (!Number.isFinite(input.hoursRequired) || input.hoursRequired <= 0))
    ) {
      throw new InvalidPricingQuoteRequestError();
    }
  }

  private selectRule(
    rules: PricingCategoryRuleSummary[],
    input: CreatePricingQuoteInput,
  ): PricingCategoryRuleSummary {
    return (
      rules.find(
        (rule) =>
          rule.isActive &&
          rule.categoryId &&
          rule.categoryId === input.categoryId &&
          (rule.pricingMode === 'any' || rule.pricingMode === input.pricingMode),
      ) ??
      rules.find(
        (rule) =>
          rule.isActive &&
          (rule.pricingMode === 'any' || rule.pricingMode === input.pricingMode),
      ) ??
      DEFAULT_RULE
    );
  }

  private selectFuelIndex(
    rows: PricingFuelIndexSummary[],
    region: string,
  ): PricingFuelIndexSummary | null {
    const normalizedRegion = region.trim().toLowerCase();
    return (
      rows.find((row) => row.region.toLowerCase() === normalizedRegion) ??
      rows.find((row) => row.region.toLowerCase() === 'default') ??
      rows[0] ??
      null
    );
  }

  private confidence(
    fallbackUsed: boolean,
    staleFuelIndex: boolean,
    input: CreatePricingQuoteInput,
  ): PricingConfidence {
    if (fallbackUsed && staleFuelIndex) {
      return 'low';
    }
    if (fallbackUsed || staleFuelIndex || !input.categoryId) {
      return 'medium';
    }
    return 'high';
  }

  private fairnessStatus(
    providerAdjustedEstimate: number,
    fairRangeMin: number,
    fairRangeMax: number,
    warnPercent: number,
  ): PricingFairnessStatus {
    const warnRatio = warnPercent / 100;
    if (providerAdjustedEstimate < fairRangeMin * (1 - warnRatio)) {
      return 'below_range';
    }
    if (providerAdjustedEstimate > fairRangeMax * (1 + warnRatio)) {
      return 'above_range';
    }
    return 'within_range';
  }

  private urgencyMultiplier(
    input: CreatePricingQuoteInput,
    rule: PricingCategoryRuleSummary,
  ): number {
    if (input.bookingUrgency === 'emergency') {
      return rule.urgencyEmergencyMultiplier;
    }
    if (input.bookingUrgency === 'priority') {
      return rule.urgencyPriorityMultiplier;
    }
    return 0;
  }

  private explanation(
    fairnessStatus: PricingFairnessStatus,
    confidence: PricingConfidence,
    categoryName: string,
  ): string {
    if (confidence === 'low') {
      return `This estimate uses fallback travel or gas inputs for ${categoryName}. Review the breakdown before booking.`;
    }
    if (fairnessStatus === 'above_range') {
      return `This estimate is above the usual fair range for ${categoryName}.`;
    }
    if (fairnessStatus === 'below_range') {
      return `This estimate is below the usual fair range for ${categoryName}.`;
    }
    return `This estimate is within typical rates for ${categoryName}.`;
  }

  private nonNegativeOrNull(value: number | null | undefined): number | null {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return null;
    }
    return value;
  }

  private isStaleFuelIndex(row: PricingFuelIndexSummary | null): boolean {
    if (!row) {
      return true;
    }
    const ageMs = Date.now() - new Date(row.effectiveAt).getTime();
    return ageMs > 7 * 24 * 60 * 60 * 1000;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private roundPeso(value: number): number {
    return Math.round(value);
  }

  private quoteTtlSeconds(): number {
    const parsed = Number(process.env.PRICING_QUOTE_TTL_SECONDS);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 15 * 60;
  }

  private defaultFuelPrice(): number {
    const parsed = Number(process.env.PRICING_DEFAULT_FUEL_PRICE_PER_LITER);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 68;
  }

  private vehicleEfficiencyKmPerLiter(): number {
    const parsed = Number(
      process.env.PRICING_DEFAULT_VEHICLE_EFFICIENCY_KM_PER_LITER,
    );
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  private defaultTravelFee(): number {
    const parsed = Number(process.env.PRICING_DEFAULT_TRAVEL_FEE);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 120;
  }
}
