export class InvalidPaymentRequestError extends Error {
  constructor() {
    super('invalid_payment_request');
  }
}

export class PaymentNotFoundError extends Error {
  constructor() {
    super('payment_not_found');
  }
}

export class PaymentDependencyUnavailableError extends Error {
  constructor() {
    super('payment_dependency_unavailable');
  }
}
