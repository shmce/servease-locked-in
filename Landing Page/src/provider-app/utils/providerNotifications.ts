interface ProviderNotificationLinkInput {
  type: string
  metadata: Record<string, unknown> | null
}

function metadataString(
  metadata: Record<string, unknown> | null,
  key: string,
): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.trim() ? value : null
}

export function getProviderNotificationHref(
  notification: ProviderNotificationLinkInput,
): string | null {
  const bookingId = metadataString(notification.metadata, 'bookingId')
  if (bookingId) {
    return `/provider/bookings?bookingId=${encodeURIComponent(bookingId)}`
  }

  const ticketId = metadataString(notification.metadata, 'ticketId')
  if (ticketId) {
    return `/provider/help-center?ticketId=${encodeURIComponent(ticketId)}`
  }

  const reviewId = metadataString(notification.metadata, 'reviewId')
  if (reviewId) {
    return `/provider/reviews?reviewId=${encodeURIComponent(reviewId)}`
  }

  const conversationId = metadataString(notification.metadata, 'conversationId')
  if (conversationId) {
    return `/provider/messages?conversationId=${encodeURIComponent(conversationId)}`
  }

  const paymentId = metadataString(notification.metadata, 'paymentId')
  if (paymentId || notification.type === 'payment_reserved') {
    return paymentId
      ? `/provider/earningsdashboard?paymentId=${encodeURIComponent(paymentId)}`
      : '/provider/earningsdashboard'
  }

  return null
}
