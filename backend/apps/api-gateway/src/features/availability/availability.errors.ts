export class AvailabilityDependencyUnavailableError extends Error {
  constructor() {
    super('availability_dependency_unavailable');
  }
}

export class InvalidAvailabilityRequestError extends Error {
  constructor() {
    super('invalid_availability_request');
  }
}

export class ProviderProfileRequiredError extends Error {
  constructor() {
    super('provider_profile_required');
  }
}
