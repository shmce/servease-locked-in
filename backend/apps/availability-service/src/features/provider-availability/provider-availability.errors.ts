export class InvalidAvailabilityRequestError extends Error {
  constructor() {
    super('invalid_availability_request');
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
