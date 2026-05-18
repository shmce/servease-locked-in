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

export class ProviderListingNotFoundError extends Error {
  constructor() {
    super('provider_listing_not_found');
  }
}

export class PricingDependencyUnavailableError extends Error {
  constructor() {
    super('pricing_dependency_unavailable');
  }
}
