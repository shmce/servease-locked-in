export class ServEaseApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly response: Response;

  constructor(input: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
    response: Response;
  }) {
    super(input.message);
    this.name = 'ServEaseApiError';
    this.status = input.status;
    this.code = input.code;
    this.details = input.details;
    this.response = input.response;
  }
}
