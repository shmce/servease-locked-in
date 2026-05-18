import type { BookingSummary } from '../../services/serveaseProviderApi'

export interface ProviderCalendarBooking {
  id: string
  bookingReference: string
  time: string
  service: string
  customer: string
  amount: number
  status: BookingSummary['status']
}

const providerTimeZone = 'Asia/Manila'

export function getCalendarDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: providerTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}

export function groupBookingsForProviderCalendar(
  bookings: BookingSummary[],
): Record<string, ProviderCalendarBooking[]> {
  const grouped: Record<string, ProviderCalendarBooking[]> = {}

  for (const booking of bookings) {
    const scheduledAt = new Date(booking.scheduledAt)
    const dateKey = getCalendarDateKey(scheduledAt)
    const items = grouped[dateKey] ?? []

    items.push({
      id: booking.id,
      bookingReference: booking.bookingReference,
      time: formatCalendarTime(scheduledAt),
      service: booking.serviceTitle || 'Service booking',
      customer: booking.customerFullName || fallbackCustomerLabel(booking.customerId),
      amount: booking.totalAmount,
      status: booking.status,
    })
    grouped[dateKey] = items
  }

  for (const items of Object.values(grouped)) {
    items.sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time))
  }

  return Object.fromEntries(
    Object.entries(grouped).sort(([left], [right]) => left.localeCompare(right)),
  )
}

export function getCalendarBookingTotal(
  bookings: ProviderCalendarBooking[],
): number {
  return bookings.reduce((total, booking) => total + booking.amount, 0)
}

function formatCalendarTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: providerTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function fallbackCustomerLabel(customerId: string): string {
  return `Customer ${customerId.slice(0, 8)}`
}

function timeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i.exec(time)
  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  const hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3].toUpperCase()
  const normalizedHour = hour === 12 ? 0 : hour

  return normalizedHour * 60 + minute + (meridiem === 'PM' ? 12 * 60 : 0)
}
