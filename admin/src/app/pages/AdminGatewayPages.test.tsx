// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Broadcasts, Support } from "./AdminGatewayPages";
import {
  addAdminSupportTicketReply,
  listAdminSupportTicketReplies,
  listAdminSupportTickets,
  sendAdminBroadcast,
} from "../../services/serveaseAdminApi";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "admin-token",
    admin: {
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "Admin",
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../services/serveaseAdminApi", () => ({
  getAdminUsersSummary: vi.fn(),
  addAdminSupportTicketReply: vi.fn(),
  listAdminBroadcasts: vi.fn().mockResolvedValue([]),
  listAdminSupportTickets: vi.fn(),
  listAdminSupportTicketReplies: vi.fn(),
  listAdminUsers: vi.fn(),
  sendAdminBroadcast: vi.fn().mockResolvedValue({
    id: "broadcast-1",
    adminUserId: "admin-1",
    audience: "customers",
    audienceCohort: null,
    title: "Maintenance window",
    message: "Service updates tonight.",
    status: "sent",
    scheduledAt: null,
    repeatRule: "none",
    deliveredCount: 3,
    failedCount: 0,
    sentAt: "2026-05-18T00:00:00.000Z",
    createdAt: "2026-05-18T00:00:00.000Z",
  }),
  updateAdminSupportTicketStatus: vi.fn(),
  updateAdminUserStatus: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("Broadcasts", () => {
  it("submits the selected APICenter broadcast channels", async () => {
    render(<Broadcasts />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Maintenance window" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Service updates tonight." },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Email" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
    fireEvent.click(screen.getByRole("button", { name: "Send Broadcast" }));

    await waitFor(() => {
      expect(sendAdminBroadcast).toHaveBeenCalledWith(
        "admin-token",
        expect.objectContaining({
          channels: ["in_app", "email", "sms"],
        }),
      );
    });
  });
});

describe("Support", () => {
  it("lets admins load a ticket thread and send a reply", async () => {
    vi.mocked(listAdminSupportTickets).mockResolvedValue([
      {
        id: "ticket-1",
        userId: "customer-1",
        subject: "Provider did not arrive",
        message: "I need help with an incident.",
        category: "incident",
        status: "open",
        createdAt: "2026-05-18T00:00:00.000Z",
      },
    ]);
    vi.mocked(listAdminSupportTicketReplies).mockResolvedValue([
      {
        id: "reply-1",
        ticketId: "ticket-1",
        repliedBy: "customer-1",
        message: "Can someone help?",
        createdAt: "2026-05-18T00:05:00.000Z",
      },
    ]);
    vi.mocked(addAdminSupportTicketReply).mockResolvedValue({
      id: "reply-2",
      ticketId: "ticket-1",
      repliedBy: "admin-1",
      message: "We are checking with the provider now.",
      createdAt: "2026-05-18T00:10:00.000Z",
    });

    render(<Support />);

    fireEvent.click(await screen.findByRole("button", { name: /reply/i }));

    await waitFor(() => {
      expect(listAdminSupportTicketReplies).toHaveBeenCalledWith(
        "admin-token",
        "ticket-1",
      );
    });
    expect(await screen.findByText("Can someone help?")).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Type a reply to the customer or provider..."),
      {
        target: { value: "We are checking with the provider now." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /send reply/i }));

    await waitFor(() => {
      expect(addAdminSupportTicketReply).toHaveBeenCalledWith(
        "admin-token",
        "ticket-1",
        {
          repliedBy: "admin-1",
          message: "We are checking with the provider now.",
        },
      );
    });
    expect(
      await screen.findByText("We are checking with the provider now."),
    ).toBeInTheDocument();
  });
});
