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

export class TimeOffTooSoonError extends Error {
  constructor() {
    super('time_off_too_soon');
  }
}

export class TimeOffConflictsBookingError extends Error {
  constructor() {
    super('time_off_conflicts_booking');
  }
}
