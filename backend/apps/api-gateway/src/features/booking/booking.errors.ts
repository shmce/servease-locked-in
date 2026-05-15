export class BookingDependencyUnavailableError extends Error {
  constructor() {
    super('booking_dependency_unavailable');
  }
}

export class InvalidBookingRequestError extends Error {
  constructor() {
    super('invalid_booking_request');
  }
}

export class InvalidBookingTransitionError extends Error {
  constructor() {
    super('invalid_booking_transition');
  }
}

export class BookingNotFoundError extends Error {
  constructor() {
    super('booking_not_found');
  }
}

export class ProviderUnavailableError extends Error {
  constructor() {
    super('provider_unavailable');
  }
}

export class ProviderProfileRequiredError extends Error {
  constructor() {
    super('provider_profile_required');
  }
}
