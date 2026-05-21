import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getCurrentUser,
  refreshSupabaseSession,
  signInWithPassword,
  type CurrentUserProfile,
  type SupabaseAuthSession,
} from "../../services/serveaseAdminApi";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = "servease_admin";
const TOKEN_STORAGE_KEY = "servease_admin_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "servease_admin_refresh_token";
const EXPIRES_AT_STORAGE_KEY = "servease_admin_access_token_expires_at";
const REFRESH_SKEW_MS = 60_000;

function toAdmin(profile: CurrentUserProfile): Admin {
  return {
    id: profile.user.id,
    name: profile.user.fullName || profile.user.email,
    email: profile.user.email,
    role: "Admin",
  };
}

function getExpiresAt(session: SupabaseAuthSession): number | null {
  return session.expiresIn ? Date.now() + session.expiresIn * 1000 : null;
}

function isExpiringSoon(expiresAt: number | null): boolean {
  return !!expiresAt && expiresAt - Date.now() <= REFRESH_SKEW_MS;
}

function readStoredExpiresAt(): number | null {
  const value = Number(localStorage.getItem(EXPIRES_AT_STORAGE_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function clearStoredSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(EXPIRES_AT_STORAGE_KEY);
}

function persistSession(admin: Admin, session: SupabaseAuthSession) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
  localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);

  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
  }

  const expiresAt = getExpiresAt(session);
  if (expiresAt) {
    localStorage.setItem(EXPIRES_AT_STORAGE_KEY, String(expiresAt));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      if (!storedAdmin || !storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        let nextSession: SupabaseAuthSession | null = null;
        let nextAccessToken = storedToken;

        if (storedRefreshToken && isExpiringSoon(readStoredExpiresAt())) {
          nextSession = await refreshSupabaseSession(storedRefreshToken);
          nextAccessToken = nextSession.accessToken;
        }

        const profile = await getCurrentUser(nextAccessToken);

        if (profile.user.role !== "admin") {
          throw new Error("Access restricted. This portal is for authorized admins only.");
        }

        const restoredAdmin = toAdmin(profile);
        setAdmin(restoredAdmin);
        setAccessToken(nextAccessToken);

        if (nextSession) {
          persistSession(restoredAdmin, nextSession);
        } else {
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(restoredAdmin));
        }
      } catch (error) {
        clearStoredSession();
        setAdmin(null);
        setAccessToken(null);
        setSessionExpired(true);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const session = await signInWithPassword(email, password);
      const profile = await getCurrentUser(session.accessToken);

      if (profile.user.role !== "admin") {
        return {
          success: false,
          error: "Access restricted. This portal is for authorized admins only.",
        };
      }

      if (profile.user.status !== "active") {
        return {
          success: false,
          error: "This admin account is inactive. Contact a Super Admin.",
        };
      }

      const nextAdmin = toAdmin(profile);
      setAdmin(nextAdmin);
      setAccessToken(session.accessToken);
      persistSession(nextAdmin, session);
      setSessionExpired(false);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Incorrect email or password.",
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    setAccessToken(null);
    clearStoredSession();
  };

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    const expiresAt = readStoredExpiresAt();

    if (!refreshToken || !expiresAt) {
      return undefined;
    }

    const refreshDelay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 0);
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const session = await refreshSupabaseSession(refreshToken);
          const profile = await getCurrentUser(session.accessToken);

          if (profile.user.role !== "admin" || profile.user.status !== "active") {
            throw new Error("Admin session is no longer active.");
          }

          const nextAdmin = toAdmin(profile);
          setAdmin(nextAdmin);
          setAccessToken(session.accessToken);
          persistSession(nextAdmin, session);
          setSessionExpired(false);
        } catch {
          clearStoredSession();
          setAdmin(null);
          setAccessToken(null);
          setSessionExpired(true);
        }
      })();
    }, refreshDelay);

    return () => window.clearTimeout(timeoutId);
  }, [accessToken]);

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        accessToken,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        sessionExpired,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
