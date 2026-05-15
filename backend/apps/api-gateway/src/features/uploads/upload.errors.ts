export class InvalidUploadRequestError extends Error {
  constructor() {
    super('invalid_upload_request');
  }
}

export class UploadDependencyUnavailableError extends Error {
  constructor() {
    super('upload_dependency_unavailable');
  }
}
