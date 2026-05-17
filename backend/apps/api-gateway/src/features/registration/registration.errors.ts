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

export class ProviderApplicationNotFoundError extends Error {
  constructor() {
    super('provider_application_not_found');
  }
}

export class ProviderApplicationDependencyUnavailableError extends Error {
  constructor() {
    super('provider_application_dependency_unavailable');
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

export class InvalidSharedAuthRequestError extends Error {
  constructor() {
    super('invalid_shared_auth_request');
  }
}

export class SharedAuthDependencyUnavailableError extends Error {
  constructor() {
    super('shared_auth_dependency_unavailable');
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
