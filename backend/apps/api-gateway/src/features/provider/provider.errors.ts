export class ProviderProfileRequiredError extends Error {}
export class InvalidProviderRequestError extends Error {}
export class ProviderApprovalRequiredError extends Error {
  constructor() {
    super('provider_approval_required');
  }
}
