export class InvalidAdminBookingRequestError extends Error {
  constructor() {
    super('invalid_admin_booking_request');
  }
}
