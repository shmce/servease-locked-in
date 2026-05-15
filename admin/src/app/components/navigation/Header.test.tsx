// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./Header";

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    admin: {
      name: "ServEase Admin",
      email: "servease-admin-test@example.com",
      role: "Admin",
    },
    logout: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useAdminGatewayData", () => ({
  useAdminGatewayData: () => ({
    isLoading: false,
    supportTickets: [
      {
        id: "ticket-1",
        subject: "Payment issue",
        status: "open",
        createdAt: "2026-05-16T00:00:00.000Z",
      },
    ],
    payments: [
      {
        id: "payment-1",
        amount: 1500,
        status: "refunded",
        createdAt: "2026-05-16T00:00:00.000Z",
      },
    ],
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("navigates route search results without backend calls", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("Search routes, endpoints, payments, support..."), "backend");
    await user.keyboard("{Enter}");

    expect(navigateMock).toHaveBeenCalledWith("/backend-support");
  });

  it("shows live gateway-derived notifications", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );

    await user.click(screen.getByTitle("Notifications"));

    expect(screen.getByText("Support ticket needs attention")).toBeInTheDocument();
    expect(screen.getByText("Payment exception")).toBeInTheDocument();
  });
});
