export class InvalidAdminAuditRequestError extends Error {
  constructor() {
    super('invalid_admin_audit_request');
  }
}
