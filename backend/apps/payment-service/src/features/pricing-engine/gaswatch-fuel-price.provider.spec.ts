import { GasWatchFuelPriceProvider } from './gaswatch-fuel-price.provider';

describe('GasWatchFuelPriceProvider', () => {
  it('parses the latest GasWatch PH diesel average from data.js', () => {
    const provider = new GasWatchFuelPriceProvider();

    const price = provider.parseDataScript(`
      const LAST_UPDATED = "May 19, 2026";
      const PRICE_HISTORY = [
        {
          week: "2026-05-19",
          label: "May 19 - 25",
          dieselAvg: 89.84,
          unleadedAvg: 89.04,
          brands: {}
        }
      ];
    `);

    expect(price).toEqual({
      effectiveAt: '2026-05-19T00:00:00.000Z',
      fuelType: 'diesel',
      pricePerLiter: 89.84,
      region: 'default',
      source: 'gaswatch-ph:diesel:metro-manila-average',
    });
  });

  it('can derive an average of diesel and unleaded when configured', () => {
    const provider = new GasWatchFuelPriceProvider(undefined, {
      fuelType: 'average',
    });

    const price = provider.parseDataScript(`
      const LAST_UPDATED = "May 19, 2026";
      const PRICE_HISTORY = [
        { week: "2026-05-19", dieselAvg: 89.84, unleadedAvg: 89.04 }
      ];
    `);

    expect(price.pricePerLiter).toBe(89.44);
    expect(price.source).toBe('gaswatch-ph:average:metro-manila-average');
  });

  it('rejects missing or unrealistic GasWatch PH prices', () => {
    const provider = new GasWatchFuelPriceProvider();

    expect(() =>
      provider.parseDataScript(`
        const LAST_UPDATED = "May 19, 2026";
        const PRICE_HISTORY = [{ week: "2026-05-19", dieselAvg: 500 }];
      `),
    ).toThrow('pricing_fuel_sync_unavailable');
  });
});
