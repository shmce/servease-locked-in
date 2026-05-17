export class InvalidBookingTransitionError extends Error {
  constructor() {
    super('invalid_booking_transition');
  }
}

export class InvalidBookingRequestError extends Error {
  constructor() {
    super('invalid_booking_request');
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

export class AttachmentNotFoundError extends Error {
  constructor() {
    super('attachment_not_found');
  }
}

export class AttachmentForbiddenError extends Error {
  constructor() {
    super('attachment_forbidden');
  }
}

export class DisputeForbiddenError extends Error {
  constructor() {
    super('dispute_forbidden');
  }
}
