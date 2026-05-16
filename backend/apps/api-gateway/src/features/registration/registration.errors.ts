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

export class RegistrationDependencyUnavailableError extends Error {
  constructor() {
    super('registration_dependency_unavailable');
  }
}

export class InvalidPasswordResetRequestError extends Error {
  constructor() {
    super('invalid_password_reset_request');
  }
}

export class PasswordResetDependencyUnavailableError extends Error {
  constructor() {
    super('password_reset_dependency_unavailable');
  }
}

export class InvalidPasswordChangeRequestError extends Error {
  constructor() {
    super('invalid_password_change_request');
  }
}

export class PasswordChangeDependencyUnavailableError extends Error {
  constructor() {
    super('password_change_dependency_unavailable');
  }
}
