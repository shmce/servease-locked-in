export class InvalidSupportTicketRequestError extends Error {
  constructor() {
    super('invalid_support_ticket_request');
  }
}

export class SupportTicketNotFoundError extends Error {
  constructor() {
    super('support_ticket_not_found');
  }
}
