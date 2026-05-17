import { describe, expect, it } from "vitest"
import {
  buildCustomerGrowthData,
  buildProviderOverviewData,
  buildRevenueCommissionData,
} from "./dashboardLiveCharts"

describe("dashboardLiveCharts", () => {
  it("builds cumulative customer growth from live admin users", () => {
    const data = buildCustomerGrowthData(
      [
        {
          role: "customer",
          createdAt: "2026-03-15T00:00:00.000Z",
        },
        {
          role: "customer",
          createdAt: "2026-05-01T00:00:00.000Z",
        },
        {
          role: "provider",
          createdAt: "2026-05-01T00:00:00.000Z",
        },
      ],
      4,
      new Date("2026-05-18T00:00:00.000Z"),
    )

    expect(data).toEqual([
      { month: "Nov 2025", customers: 2 },
      { month: "Dec 2025", customers: 2 },
      { month: "Jan 2026", customers: 2 },
      { month: "Feb 2026", customers: 2 },
      { month: "Mar 2026", customers: 3 },
      { month: "Apr 2026", customers: 3 },
      { month: "May 2026", customers: 4 },
    ])
  })

  it("groups provider listings by live service category", () => {
    const data = buildProviderOverviewData({
      categories: [
        { id: "cat-market", name: "Marketplace" },
        { id: "cat-home", name: "Home Services" },
      ],
      services: [
        { id: "svc-1", categoryId: "cat-market" },
        { id: "svc-2", categoryId: "cat-home" },
      ],
      providerListings: [
        {
          providerId: "provider-1",
          providerBusinessName: "Provider One",
          serviceId: "svc-1",
          verificationStatus: "approved",
          averageRating: 4.8,
          reviewCount: 12,
          price: 1000,
        },
        {
          providerId: "provider-2",
          providerBusinessName: "Provider Two",
          serviceId: "svc-1",
          verificationStatus: "pending",
          averageRating: 0,
          reviewCount: 0,
          price: 500,
        },
        {
          providerId: "provider-3",
          providerBusinessName: "Provider Three",
          serviceId: "svc-2",
          verificationStatus: "approved",
          averageRating: 5,
          reviewCount: 2,
          price: 250,
        },
      ],
    })

    expect(data).toEqual([
      { category: "Marketplace", Active: 1, Pending: 1 },
      { category: "Home Services", Active: 1, Pending: 0 },
    ])
  })

  it("builds seven-day revenue and commission series from paid payments", () => {
    const data = buildRevenueCommissionData(
      [
        {
          amount: 2500,
          platformFee: 300,
          status: "paid",
          paidAt: "2026-05-18T10:00:00.000+08:00",
          createdAt: "2026-05-17T10:00:00.000+08:00",
        },
        {
          amount: 1000,
          platformFee: 120,
          status: "pending",
          paidAt: null,
          createdAt: "2026-05-18T12:00:00.000+08:00",
        },
        {
          amount: 1500,
          platformFee: 150,
          status: "paid",
          paidAt: "2026-05-16T09:00:00.000+08:00",
          createdAt: "2026-05-16T08:00:00.000+08:00",
        },
      ],
      new Date(2026, 4, 18, 23),
    )

    expect(data).toEqual([
      { date: "May 12", revenue: 0, commission: 0 },
      { date: "May 13", revenue: 0, commission: 0 },
      { date: "May 14", revenue: 0, commission: 0 },
      { date: "May 15", revenue: 0, commission: 0 },
      { date: "May 16", revenue: 1.5, commission: 0.2 },
      { date: "May 17", revenue: 0, commission: 0 },
      { date: "May 18", revenue: 2.5, commission: 0.3 },
    ])
  })
})
