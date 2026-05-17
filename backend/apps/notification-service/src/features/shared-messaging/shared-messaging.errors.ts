export class InvalidSharedMessagingRequestError extends Error {
  constructor() {
    super('invalid_shared_messaging_request');
  }
}

export class SharedMessagingDependencyUnavailableError extends Error {
  constructor() {
    super('shared_messaging_dependency_unavailable');
  }
}

