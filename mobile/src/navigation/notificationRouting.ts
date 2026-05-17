import { AppRole, AppScreen } from './types';

export interface NotificationRoutingInput {
  role: AppRole;
  type?: string | null;
  metadata?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
}

export interface NotificationRouteIntent {
  role: AppRole;
  screen: AppScreen;
  bookingId?: string;
  conversationId?: string;
  ticketId?: string;
}

export function resolveNotificationRoute(
  input: NotificationRoutingInput,
): NotificationRouteIntent {
  const payload = {
    ...(input.metadata ?? {}),
    ...(input.data ?? {}),
  };
  const type = String(input.type ?? payload.type ?? '');

  const ticketId = stringValue(payload.ticketId);
  if (ticketId || type.startsWith('support_')) {
    return {
      role: input.role,
      screen: input.role === 'provider' ? 'providerHelp' : 'customerHelp',
      ticketId,
    };
  }

  const conversationId = stringValue(payload.conversationId);
  if (conversationId || type.includes('conversation') || type.includes('message')) {
    return {
      role: input.role,
      screen: 'messages',
      conversationId,
    };
  }

  const bookingId = stringValue(payload.bookingId);
  if (bookingId || type.includes('booking')) {
    return {
      role: input.role,
      screen:
        input.role === 'provider'
          ? 'providerBookingDetail'
          : 'customerBookingDetail',
      bookingId,
    };
  }

  if (
    stringValue(payload.paymentId) ||
    stringValue(payload.payoutId) ||
    type.includes('payment') ||
    type.includes('payout')
  ) {
    return {
      role: input.role,
      screen:
        input.role === 'provider'
          ? 'providerPayoutManagement'
          : 'customerPaymentMethods',
    };
  }

  if (stringValue(payload.reviewId) || type.includes('review')) {
    return {
      role: input.role,
      screen: input.role === 'provider' ? 'providerInsights' : 'customerServiceHistory',
    };
  }

  return {
    role: input.role,
    screen:
      input.role === 'provider' ? 'providerNotifications' : 'customerNotifications',
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
