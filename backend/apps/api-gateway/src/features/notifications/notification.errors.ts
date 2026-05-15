export class NotificationDependencyUnavailableError extends Error {
  constructor() {
    super('notification_dependency_unavailable');
  }
}
