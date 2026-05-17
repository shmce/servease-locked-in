export class InvalidAdminReportScheduleRequestError extends Error {
  constructor(message = 'Report schedule request is invalid.') {
    super(message);
    this.name = 'InvalidAdminReportScheduleRequestError';
  }
}
