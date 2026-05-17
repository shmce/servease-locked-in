// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    const user = userEvent.setup();
    render(<Broadcasts />);

    await user.type(screen.getByLabelText("Title"), "Maintenance window");
    await user.type(screen.getByLabelText("Message"), "Service updates tonight.");
    await user.click(screen.getByRole("checkbox", { name: "Email" }));
    await user.click(screen.getByRole("checkbox", { name: "SMS" }));
    await user.click(screen.getByRole("button", { name: "Send Broadcast" }));

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
