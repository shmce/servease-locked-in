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

