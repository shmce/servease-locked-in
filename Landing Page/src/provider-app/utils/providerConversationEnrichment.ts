type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'

interface ProviderBookingLike {
  id: string
  bookingReference: string
  customerId?: string
  customerFullName?: string | null
  customerContactNumber?: string | null
  providerId?: string
  serviceId?: string | null
  serviceTitle: string | null
  serviceAddress?: string | null
  scheduledAt: string
  status: BookingStatus
  totalAmount?: number
}

interface ProviderConversationLike {
  id: number | string
  bookingId?: string | null
  name: string
  avatar: string
  bookingRef?: string
  booking?: {
    serviceType: string
    date: string
    time: string
    status: string
  }
}

export function enrichProviderConversationsWithBookings<
  TConversation extends ProviderConversationLike,
>(
  conversations: TConversation[],
  bookings: ProviderBookingLike[],
): TConversation[] {
  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]))

  return conversations.map((conversation) => {
    if (!conversation.bookingId) {
      return conversation
    }

    const booking = bookingsById.get(conversation.bookingId)
    if (!booking) {
      return conversation
    }

    const customerName = booking.customerFullName?.trim() || conversation.name

    return {
      ...conversation,
      name: customerName,
      avatar: initialsFromName(customerName),
      bookingRef: booking.bookingReference,
      booking: {
        serviceType: booking.serviceTitle || 'Service Booking',
        date: formatBookingDate(booking.scheduledAt),
        time: formatBookingTime(booking.scheduledAt),
        status: formatBookingStatus(booking.status),
      },
    }
  })
}

function initialsFromName(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

  return initials || 'SE'
}

function formatBookingDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  })
}

function formatBookingTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  })
}

function formatBookingStatus(status: BookingStatus): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
