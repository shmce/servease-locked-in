export class InvalidNotificationRequestError extends Error {
  constructor() {
    super('invalid_notification_request');
  }
}

export class NotificationNotFoundError extends Error {
  constructor() {
    super('notification_not_found');
  }
}
