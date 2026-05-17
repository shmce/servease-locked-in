export class InvalidAdminIntegrationRequestError extends Error {
  constructor(message = 'Integration request is invalid.') {
    super(message);
    this.name = 'InvalidAdminIntegrationRequestError';
  }
}

export class AdminIntegrationNotFoundError extends Error {
  constructor(provider: string) {
    super(`Integration "${provider}" is not registered.`);
    this.name = 'AdminIntegrationNotFoundError';
  }
}
