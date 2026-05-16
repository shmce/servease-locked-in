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
