export class AdminRequiredError extends Error {
  constructor() {
    super('admin_required');
  }
}

export class InvalidAdminRequestError extends Error {
  constructor() {
    super('invalid_admin_request');
  }
}

export class AdminDependencyUnavailableError extends Error {
  constructor() {
    super('admin_dependency_unavailable');
  }
}

export class AdminServiceRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
