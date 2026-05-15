export class InvalidMessagingRequestError extends Error {
  constructor() {
    super('invalid_messaging_request');
  }
}

export class ConversationNotFoundError extends Error {
  constructor() {
    super('conversation_not_found');
  }
}

export class ConversationForbiddenError extends Error {
  constructor() {
    super('conversation_forbidden');
  }
}

export class MessagingDependencyUnavailableError extends Error {
  constructor() {
    super('messaging_dependency_unavailable');
  }
}
