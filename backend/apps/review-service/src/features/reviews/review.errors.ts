export class InvalidReviewRequestError extends Error {
  constructor() {
    super('invalid_review_request');
  }
}

export class ReviewNotFoundError extends Error {
  constructor() {
    super('review_not_found');
  }
}
