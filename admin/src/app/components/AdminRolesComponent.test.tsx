// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminRolesComponent } from "./AdminRolesComponent";
import { deleteAdminUser, listAdminUsers } from "../../services/serveaseAdminApi";

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "admin-token",
    admin: {
      id: "admin-current",
      name: "Current Admin",
      email: "current@example.com",
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
  listAdminUsers: vi.fn().mockResolvedValue([
    {
      id: "admin-1",
      email: "admin@example.com",
      fullName: "Backend Admin",
      contactNumber: null,
      role: "admin",
      accessRole: "finance-manager",
      accessRoleLabel: "Finance Manager",
      permissions: ["finance.manage", "refunds.manage"],
      requireTwoFactor: false,
      invitationSent: true,
      status: "active",
      createdAt: "2026-05-17T00:00:00.000Z",
    },
  ]),
  updateAdminUserAccess: vi.fn(),
  updateAdminUserStatus: vi.fn(),
  deleteAdminUser: vi.fn().mockResolvedValue({
    id: "admin-1",
    email: "admin@example.com",
    fullName: "Backend Admin",
    contactNumber: null,
    role: "admin",
    accessRole: "finance-manager",
    status: "active",
    createdAt: "2026-05-17T00:00:00.000Z",
  }),
}));

describe("AdminRolesComponent", () => {
  it("loads admin roles and permissions from the gateway", async () => {
    render(<AdminRolesComponent />);

    await waitFor(() => {
      expect(listAdminUsers).toHaveBeenCalledWith("admin-token", {
        role: "admin",
      });
    });

    await waitFor(() => {
      expect(screen.getAllByText("Backend Admin").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Finance Manager")[0]).toBeInTheDocument();
    expect(screen.getByText(/finance\.manage/)).toBeInTheDocument();
  });

  it("offers a delete admin action backed by the gateway", async () => {
    render(<AdminRolesComponent />);

    await screen.findAllByText("Backend Admin");
    const menuButton = screen.getAllByRole("button", { name: /open menu/i })[0];
    fireEvent.pointerDown(menuButton);
    fireEvent.click(menuButton);
    fireEvent.click(await screen.findByText("Delete Admin"));

    expect(
      await screen.findByText("Permanently remove this admin account"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteAdminUser).toHaveBeenCalledWith("admin-token", "admin-1");
    });
  });
});
