// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PricingEngine } from "./PricingEngine";

const mocks = vi.hoisted(() => ({
  createAdminPricingFuelIndex: vi.fn(),
  listAdminPricingFuelIndex: vi.fn(),
  listAdminPricingQuoteAudits: vi.fn(),
  listAdminPricingRules: vi.fn(),
  saveAdminPricingRule: vi.fn(),
  syncAdminPricingFuelIndexFromGasWatch: vi.fn(),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ accessToken: "admin-token" }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../services/serveaseAdminApi", () => ({
  createAdminPricingFuelIndex: mocks.createAdminPricingFuelIndex,
  listAdminPricingFuelIndex: mocks.listAdminPricingFuelIndex,
  listAdminPricingQuoteAudits: mocks.listAdminPricingQuoteAudits,
  listAdminPricingRules: mocks.listAdminPricingRules,
  saveAdminPricingRule: mocks.saveAdminPricingRule,
  syncAdminPricingFuelIndexFromGasWatch: mocks.syncAdminPricingFuelIndexFromGasWatch,
}));

const defaultRule = {
  id: "rule-1",
  categoryId: null,
  categoryName: "Default services",
  pricingMode: "any",
  baselineMin: 300,
  baselineMax: 5000,
  fairBandPercent: 15,
  travelFeeMin: 0,
  travelFeeMax: 500,
  travelMultiplier: 1.2,
  travelTimeFeePerMinute: 2,
  urgencyPriorityMultiplier: 0.1,
  urgencyEmergencyMultiplier: 0.25,
  outlierWarnPercent: 20,
  isActive: true,
  updatedAt: "2026-05-19T00:00:00.000Z",
};

describe("PricingEngine guided rule editor", () => {
  beforeEach(() => {
    mocks.listAdminPricingRules.mockResolvedValue([defaultRule]);
    mocks.listAdminPricingFuelIndex.mockResolvedValue([
      {
        id: "fuel-1",
        region: "default",
        fuelPricePerLiter: 68,
        source: "admin",
        effectiveAt: "2026-05-19T00:00:00.000Z",
        createdBy: "admin-1",
        createdAt: "2026-05-19T00:00:00.000Z",
      },
    ]);
    mocks.listAdminPricingQuoteAudits.mockResolvedValue([]);
    mocks.saveAdminPricingRule.mockResolvedValue(defaultRule);
    mocks.createAdminPricingFuelIndex.mockResolvedValue({
      id: "fuel-2",
      region: "default",
      fuelPricePerLiter: 70,
      source: "admin",
      effectiveAt: "2026-05-19T01:00:00.000Z",
      createdBy: "admin-1",
      createdAt: "2026-05-19T01:00:00.000Z",
    });
    mocks.syncAdminPricingFuelIndexFromGasWatch.mockResolvedValue({
      id: "fuel-gaswatch-1",
      region: "default",
      fuelPricePerLiter: 89.84,
      source: "gaswatch-ph:diesel:metro-manila-average",
      effectiveAt: "2026-05-19T00:00:00.000Z",
      createdBy: "admin-1",
      createdAt: "2026-05-19T01:00:00.000Z",
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses a wizard as the default rule editing path and publishes all rule fields", async () => {
    const user = userEvent.setup();
    render(<PricingEngine />);

    await screen.findByText("Default services");
    await user.click(screen.getByRole("button", { name: /create rule/i }));

    expect(screen.getByRole("heading", { name: /step 1: scope/i })).toBeInTheDocument();
    expect(screen.getByText(/category-specific rules win/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next: labor baseline/i }));
    expect(screen.getByRole("heading", { name: /step 2: labor baseline/i })).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/baseline minimum/i));
    await user.type(screen.getByLabelText(/baseline minimum/i), "400");
    await user.clear(screen.getByLabelText(/baseline maximum/i));
    await user.type(screen.getByLabelText(/baseline maximum/i), "2500");

    await user.click(screen.getByRole("button", { name: /next: travel and fuel/i }));
    expect(screen.getByRole("heading", { name: /step 3: travel and fuel/i })).toBeInTheDocument();
    expect(screen.getByText(/missing distance falls back/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next: urgency and outliers/i }));
    expect(screen.getByRole("heading", { name: /step 4: urgency and outliers/i })).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/fair band percent/i));
    await user.type(screen.getByLabelText(/fair band percent/i), "10");

    await user.click(screen.getByRole("button", { name: /review and publish/i }));
    expect(screen.getByRole("heading", { name: /step 5: review and publish/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /sample quote simulation/i })).toBeInTheDocument();
    expect(screen.getByText(/estimated total/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /publish rule/i }));

    await waitFor(() => {
      expect(mocks.saveAdminPricingRule).toHaveBeenCalledWith(
        "admin-token",
        expect.objectContaining({
          categoryName: "Default services",
          pricingMode: "any",
          baselineMin: 400,
          baselineMax: 2500,
          fairBandPercent: 10,
          travelFeeMin: 0,
          travelFeeMax: 500,
          travelMultiplier: 1.2,
          travelTimeFeePerMinute: 2,
          urgencyPriorityMultiplier: 0.1,
          urgencyEmergencyMultiplier: 0.25,
          outlierWarnPercent: 20,
          isActive: true,
        }),
      );
    });
  }, 10000);

  it("keeps an advanced editor for direct edits", async () => {
    const user = userEvent.setup();
    render(<PricingEngine />);

    const row = await screen.findByRole("row", { name: /default services/i });
    await user.click(within(row).getByRole("button", { name: /advanced/i }));

    expect(screen.getByRole("heading", { name: /advanced rule editor/i })).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/travel fee maximum/i));
    await user.type(screen.getByLabelText(/travel fee maximum/i), "650");
    await user.click(screen.getByRole("button", { name: /save advanced changes/i }));

    await waitFor(() => {
      expect(mocks.saveAdminPricingRule).toHaveBeenCalledWith(
        "admin-token",
        expect.objectContaining({
          ruleId: "rule-1",
          travelFeeMax: 650,
        }),
      );
    });
  });

  it("lets admins sync the fuel index from GasWatch PH instead of typing it manually", async () => {
    const user = userEvent.setup();
    render(<PricingEngine />);

    await screen.findByText("Default services");
    await user.click(screen.getByRole("button", { name: /create rule/i }));
    await user.click(screen.getByRole("button", { name: /next: labor baseline/i }));
    await user.click(screen.getByRole("button", { name: /next: travel and fuel/i }));
    await user.click(screen.getByRole("button", { name: /sync from gaswatch ph/i }));

    await waitFor(() => {
      expect(mocks.syncAdminPricingFuelIndexFromGasWatch).toHaveBeenCalledWith(
        "admin-token",
      );
    });
    expect(await screen.findByDisplayValue("89.84")).toBeInTheDocument();
    expect(screen.getAllByText(/gaswatch ph/i).length).toBeGreaterThan(0);
  });
});
