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
