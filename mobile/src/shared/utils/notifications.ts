import { NotificationSummary } from '../models/types';

export function isInternalTestNotification(notification: NotificationSummary): boolean {
  const text = `${notification.title ?? ''} ${notification.body ?? ''}`.toLowerCase();
  const metadata = notification.metadata;
  const markedTestOnly =
    metadata &&
    !Array.isArray(metadata) &&
    typeof metadata === 'object' &&
    (metadata as Record<string, unknown>).testOnly === true;

  return (
    markedTestOnly ||
    text.includes('test broadcast') ||
    text.includes('live integration test') ||
    text.includes('smoke verification')
  );
}
