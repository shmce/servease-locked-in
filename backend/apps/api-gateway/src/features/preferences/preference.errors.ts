export class InvalidUserPreferencesRequestError extends Error {
  constructor() {
    super('invalid_user_preferences_request');
  }
}

export class UserPreferencesDependencyUnavailableError extends Error {
  constructor() {
    super('user_preferences_dependency_unavailable');
  }
}
