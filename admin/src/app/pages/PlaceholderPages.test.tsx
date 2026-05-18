// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Broadcasts } from "./PlaceholderPages";
import { sendAdminBroadcast } from "../../services/serveaseAdminApi";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "admin-token",
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
  listAdminBroadcasts: vi.fn().mockResolvedValue([]),
  listAdminSupportTickets: vi.fn(),
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
