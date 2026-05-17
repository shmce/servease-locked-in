type UserRole = "customer" | "provider" | "admin" | string
type ProviderVerificationStatus = "approved" | "pending" | "rejected" | string
type PaymentStatus = "paid" | "pending" | "cancelled" | "refunded" | string

export interface DashboardUserLike {
  role: UserRole
  createdAt: string | null
}

export interface DashboardProviderListingLike {
  providerId: string
  providerBusinessName: string | null
  serviceId: string | null
  verificationStatus: ProviderVerificationStatus
  averageRating: number
  reviewCount: number
  price: number | null
}

export interface DashboardServiceLike {
  id: string
  categoryId: string | null
}

export interface DashboardCategoryLike {
  id: string
  name: string
}

export interface DashboardPaymentLike {
  amount: number
  platformFee: number
  status: PaymentStatus
  paidAt: string | null
  createdAt: string | null
}

export interface CustomerGrowthPoint {
  month: string
  customers: number
}

export interface ProviderOverviewPoint {
  category: string
  Active: number
  Pending: number
}

export interface RevenueCommissionPoint {
  date: string
  revenue: number
  commission: number
}

export function buildCustomerGrowthData(
  users: DashboardUserLike[],
  totalCustomers: number,
  now = new Date(),
): CustomerGrowthPoint[] {
  const customerDates = users
    .filter((user) => user.role === "customer")
    .map((user) => parseDate(user.createdAt))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime())
  const baseline = Math.max(0, totalCustomers - customerDates.length)

  return lastMonthStarts(now, 7).map((monthStart) => {
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )

    return {
      month: monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      customers:
        baseline +
        customerDates.filter((date) => date.getTime() <= monthEnd.getTime()).length,
    }
  })
}

export function buildProviderOverviewData(input: {
  providerListings: DashboardProviderListingLike[]
  services: DashboardServiceLike[]
  categories: DashboardCategoryLike[]
  limit?: number
}): ProviderOverviewPoint[] {
  const serviceCategoryIds = new Map(
    input.services.map((service) => [service.id, service.categoryId]),
  )
  const categoryNames = new Map(
    input.categories.map((category) => [category.id, category.name]),
  )
  const grouped = new Map<string, ProviderOverviewPoint>()

  input.providerListings.forEach((listing) => {
    const categoryId = listing.serviceId
      ? serviceCategoryIds.get(listing.serviceId)
      : null
    const category = categoryId
      ? categoryNames.get(categoryId) ?? "Uncategorized"
      : "Uncategorized"
    const current = grouped.get(category) ?? {
      category,
      Active: 0,
      Pending: 0,
    }

    if (listing.verificationStatus === "approved") {
      current.Active += 1
    } else if (listing.verificationStatus === "pending") {
      current.Pending += 1
    }

    grouped.set(category, current)
  })

  return Array.from(grouped.values())
    .filter((item) => item.Active > 0 || item.Pending > 0)
    .sort(
      (a, b) =>
        b.Active + b.Pending - (a.Active + a.Pending) ||
        a.category.localeCompare(b.category),
    )
    .slice(0, input.limit ?? 6)
}

export function buildRevenueCommissionData(
  payments: DashboardPaymentLike[],
  now = new Date(),
): RevenueCommissionPoint[] {
  return lastDayStarts(now, 7).map((dayStart) => {
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    const paidPayments = payments.filter((payment) => {
      if (payment.status !== "paid") {
        return false
      }

      const paymentDate = parseDate(payment.paidAt ?? payment.createdAt)
      return (
        paymentDate !== null &&
        paymentDate.getTime() >= dayStart.getTime() &&
        paymentDate.getTime() <= dayEnd.getTime()
      )
    })

    return {
      date: dayStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue: roundToTenth(
        paidPayments.reduce((sum, payment) => sum + payment.amount, 0) / 1000,
      ),
      commission: roundToTenth(
        paidPayments.reduce((sum, payment) => sum + payment.platformFee, 0) /
          1000,
      ),
    }
  })
}

function lastMonthStarts(now: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1
    return new Date(now.getFullYear(), now.getMonth() - offset, 1)
  })
}

function lastDayStarts(now: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (count - index - 1))
    date.setHours(0, 0, 0, 0)
    return date
  })
}

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}
