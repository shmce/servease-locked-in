export class InvalidRegistrationRequestError extends Error {
  constructor() {
    super('invalid_registration_request');
  }
}

export class RegistrationConflictError extends Error {
  constructor() {
    super('registration_conflict');
  }
}
