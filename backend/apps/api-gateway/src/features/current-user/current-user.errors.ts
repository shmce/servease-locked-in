export class AuthRequiredError extends Error {
  constructor() {
    super('auth_required');
  }
}

export class InvalidAuthTokenError extends Error {
  constructor() {
    super('invalid_auth_token');
  }
}

export class AccountInactiveError extends Error {
  constructor() {
    super('account_inactive');
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('user_not_found');
  }
}

export class ProfileDependencyUnavailableError extends Error {
  constructor() {
    super('profile_dependency_unavailable');
  }
}

export class InvalidTwoFactorRequestError extends Error {
  constructor() {
    super('invalid_two_factor_request');
  }
}
