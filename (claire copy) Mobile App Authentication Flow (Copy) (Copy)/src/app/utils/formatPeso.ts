// ═══════════════════════════════════════════════════════════════
// ServEase – Philippine Peso (₱) Formatter Utility
// ═══════════════════════════════════════════════════════════════

/**
 * Format a number as Philippine Peso with comma separators.
 *
 * @example
 * formatPeso(1500)      // "₱1,500.00"
 * formatPeso(2500.5)    // "₱2,500.50"
 * formatPeso(0)         // "₱0.00"
 */
export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Short-format peso (no decimals) for compact UI.
 *
 * @example
 * formatPesoShort(1500)  // "₱1,500"
 */
export function formatPesoShort(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/**
 * Display provider price – picks the right format based on pricing model.
 */
export function getProviderPriceDisplay(provider: {
  hourlyRate?: number;
  flatRate?: number;
  priceRange?: { min: number; max: number };
}): string {
  if (provider.hourlyRate) {
    return `${formatPesoShort(provider.hourlyRate)}/hr`;
  }
  if (provider.flatRate) {
    return `${formatPesoShort(provider.flatRate)} flat rate`;
  }
  if (provider.priceRange) {
    return `${formatPesoShort(provider.priceRange.min)} – ${formatPesoShort(provider.priceRange.max)}`;
  }
  return "Contact for pricing";
}
