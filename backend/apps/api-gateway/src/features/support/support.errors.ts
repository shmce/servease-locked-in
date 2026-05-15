export class InvalidSupportTicketRequestError extends Error {
  constructor() {
    super('invalid_support_ticket_request');
  }
}

export class SupportDependencyUnavailableError extends Error {
  constructor() {
    super('support_dependency_unavailable');
  }
}
