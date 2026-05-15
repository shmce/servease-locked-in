export class InvalidReviewRequestError extends Error {
  constructor() {
    super('invalid_review_request');
  }
}

export class ReviewDependencyUnavailableError extends Error {
  constructor() {
    super('review_dependency_unavailable');
  }
}
