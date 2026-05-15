export class InvalidAvailabilityRequestError extends Error {
  constructor() {
    super('invalid_availability_request');
  }
}
