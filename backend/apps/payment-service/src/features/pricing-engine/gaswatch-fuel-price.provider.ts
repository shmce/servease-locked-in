import {
  PricingFuelPriceCandidate,
  PricingFuelSyncFuelType,
} from './pricing-engine.types';

interface GasWatchFuelPriceProviderOptions {
  dataUrl?: string;
  fuelType?: PricingFuelSyncFuelType;
  maxPricePerLiter?: number;
  minPricePerLiter?: number;
  region?: string;
}

const DEFAULT_DATA_URL = 'https://gaswatchph.com/js/data.js';
const DEFAULT_REGION = 'default';
const DEFAULT_SOURCE_AREA = 'metro-manila-average';

export class GasWatchFuelPriceProvider {
  constructor(
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly options: GasWatchFuelPriceProviderOptions = {},
  ) {}

  async getLatestFuelPrice(): Promise<PricingFuelPriceCandidate> {
    try {
      const response = await this.fetchImpl(this.dataUrl(), {
        headers: { accept: 'application/javascript,text/javascript,*/*' },
      });

      if (!response.ok) {
        throw new Error('gaswatch_request_failed');
      }

      return this.parseDataScript(await response.text());
    } catch {
      throw new Error('pricing_fuel_sync_unavailable');
    }
  }

  parseDataScript(source: string): PricingFuelPriceCandidate {
    const fuelType = this.fuelType();
    const dieselAvg = this.readNumber(source, 'dieselAvg');
    const unleadedAvg = this.readNumber(source, 'unleadedAvg');
    const pricePerLiter = this.priceForFuelType(fuelType, dieselAvg, unleadedAvg);
    this.assertRealisticPrice(pricePerLiter);

    return {
      region: this.region(),
      fuelType,
      pricePerLiter,
      source: `gaswatch-ph:${fuelType}:${DEFAULT_SOURCE_AREA}`,
      effectiveAt: this.effectiveAt(source),
    };
  }

  private priceForFuelType(
    fuelType: PricingFuelSyncFuelType,
    dieselAvg: number | null,
    unleadedAvg: number | null,
  ): number {
    if (fuelType === 'unleaded') {
      return this.requirePrice(unleadedAvg);
    }
    if (fuelType === 'average') {
      return this.roundToCents(
        (this.requirePrice(dieselAvg) + this.requirePrice(unleadedAvg)) / 2,
      );
    }
    return this.requirePrice(dieselAvg);
  }

  private readNumber(source: string, key: string): number | null {
    const match = source.match(new RegExp(`${key}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`));
    return match ? Number(match[1]) : null;
  }

  private requirePrice(value: number | null): number {
    if (!Number.isFinite(value)) {
      throw new Error('pricing_fuel_sync_unavailable');
    }
    return this.roundToCents(value as number);
  }

  private assertRealisticPrice(price: number): void {
    const min = this.numberOption(
      this.options.minPricePerLiter,
      process.env.PRICING_FUEL_SYNC_MIN_PRICE_PER_LITER,
      20,
    );
    const max = this.numberOption(
      this.options.maxPricePerLiter,
      process.env.PRICING_FUEL_SYNC_MAX_PRICE_PER_LITER,
      250,
    );

    if (!Number.isFinite(price) || price < min || price > max) {
      throw new Error('pricing_fuel_sync_unavailable');
    }
  }

  private effectiveAt(source: string): string {
    const week = source.match(/week\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1];
    if (week) {
      return `${week}T00:00:00.000Z`;
    }

    const updated = source.match(/LAST_UPDATED\s*=\s*["']([^"']+)["']/)?.[1];
    const parsed = updated ? this.parseDate(updated) : null;
    if (parsed) {
      return parsed;
    }

    throw new Error('pricing_fuel_sync_unavailable');
  }

  private parseDate(value: string): string | null {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDate) {
      return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}T00:00:00.000Z`;
    }

    const parsed = new Date(`${value} UTC`);
    return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
  }

  private dataUrl(): string {
    return (
      this.options.dataUrl ??
      process.env.PRICING_GASWATCH_DATA_URL ??
      process.env.GASWATCH_PH_DATA_URL ??
      DEFAULT_DATA_URL
    );
  }

  private fuelType(): PricingFuelSyncFuelType {
    const value =
      this.options.fuelType ?? process.env.PRICING_FUEL_SYNC_FUEL_TYPE ?? 'diesel';
    return ['average', 'diesel', 'unleaded'].includes(value)
      ? (value as PricingFuelSyncFuelType)
      : 'diesel';
  }

  private region(): string {
    return (
      this.options.region ??
      process.env.PRICING_FUEL_SYNC_REGION ??
      DEFAULT_REGION
    )
      .trim()
      .toLowerCase();
  }

  private numberOption(
    optionValue: number | undefined,
    envValue: string | undefined,
    fallback: number,
  ): number {
    if (Number.isFinite(optionValue)) {
      return optionValue as number;
    }
    const parsed = Number(envValue);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
