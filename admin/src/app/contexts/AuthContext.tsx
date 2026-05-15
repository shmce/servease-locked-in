import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getCurrentUser,
  signInWithPassword,
  type CurrentUserProfile,
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

function toAdmin(profile: CurrentUserProfile): Admin {
  return {
    id: profile.user.id,
    name: profile.user.fullName || profile.user.email,
    email: profile.user.email,
    role: "Admin",
  };
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

      if (!storedAdmin || !storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser(storedToken);

        if (profile.user.role !== "admin") {
          throw new Error("Access restricted. This portal is for authorized admins only.");
        }

        const restoredAdmin = toAdmin(profile);
        setAdmin(restoredAdmin);
        setAccessToken(storedToken);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(restoredAdmin));
      } catch (error) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
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
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextAdmin));
      localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken);
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
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

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
