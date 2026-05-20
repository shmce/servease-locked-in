export class InvalidPricingQuoteRequestError extends Error {
  constructor() {
    super('invalid_pricing_quote_request');
  }
}

export class InvalidPricingRuleRequestError extends Error {
  constructor() {
    super('invalid_pricing_rule_request');
  }
}

export class PricingFuelSyncUnavailableError extends Error {
  constructor() {
    super('pricing_fuel_sync_unavailable');
  }
}

export class PricingQuoteNotFoundError extends Error {
  constructor() {
    super('pricing_quote_not_found');
  }
}

export class PricingQuoteExpiredError extends Error {
  constructor() {
    super('pricing_quote_expired');
  }
}
