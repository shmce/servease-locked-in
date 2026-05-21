// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  getCurrentUser,
  refreshSupabaseSession,
  signInWithPassword,
  type CurrentUserProfile,
} from "../../services/serveaseAdminApi";

vi.mock("../../services/serveaseAdminApi", () => ({
  getCurrentUser: vi.fn(),
  refreshSupabaseSession: vi.fn(),
  signInWithPassword: vi.fn(),
}));

const adminProfile: CurrentUserProfile = {
  user: {
    id: "admin-1",
    email: "admin@example.test",
    fullName: "Admin User",
    contactNumber: null,
    role: "admin",
    status: "active",
  },
  customerProfile: null,
  providerProfile: null,
};

const storage = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key);
  }),
  clear: vi.fn(() => {
    storage.clear();
  }),
};

function Probe() {
  const { accessToken, login } = useAuth();

  return (
    <>
      <div data-testid="token">{accessToken ?? "none"}</div>
      <button
        type="button"
        onClick={() => {
          void login("admin@example.test", "password");
        }}
      >
        Log in
      </button>
    </>
  );
}

function clearAdminStorage() {
  window.localStorage.removeItem("servease_admin");
  window.localStorage.removeItem("servease_admin_access_token");
  window.localStorage.removeItem("servease_admin_refresh_token");
  window.localStorage.removeItem("servease_admin_access_token_expires_at");
}

describe("AuthContext", () => {
  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
    clearAdminStorage();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(refreshSupabaseSession).mockReset();
    vi.mocked(signInWithPassword).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    clearAdminStorage();
  });

  it("persists the refresh token and access-token expiry after admin login", async () => {
    vi.mocked(signInWithPassword).mockResolvedValue({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      expiresIn: 3600,
      tokenType: "bearer",
      user: { id: "admin-1", email: "admin@example.test" },
    });
    vi.mocked(getCurrentUser).mockResolvedValue(adminProfile);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Log in" }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId("token")).toHaveTextContent("access-1");

    expect(window.localStorage.getItem("servease_admin_refresh_token")).toBe("refresh-1");
    expect(Number(window.localStorage.getItem("servease_admin_access_token_expires_at"))).toBeGreaterThan(
      Date.now(),
    );
  });

  it("refreshes a stored admin token before restoring an expiring session", async () => {
    window.localStorage.setItem("servease_admin", JSON.stringify({
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.test",
      role: "Admin",
    }));
    window.localStorage.setItem("servease_admin_access_token", "expired-soon");
    window.localStorage.setItem("servease_admin_refresh_token", "refresh-1");
    window.localStorage.setItem(
      "servease_admin_access_token_expires_at",
      String(Date.now() + 1_000),
    );
    vi.mocked(refreshSupabaseSession).mockResolvedValue({
      accessToken: "access-2",
      refreshToken: "refresh-2",
      expiresIn: 3600,
      tokenType: "bearer",
      user: { id: "admin-1", email: "admin@example.test" },
    });
    vi.mocked(getCurrentUser).mockResolvedValue(adminProfile);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("access-2");
    });
    expect(refreshSupabaseSession).toHaveBeenCalledWith("refresh-1");
    expect(window.localStorage.getItem("servease_admin_refresh_token")).toBe("refresh-2");
  });
});
