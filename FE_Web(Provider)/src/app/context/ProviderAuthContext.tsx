import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  clearStoredProviderSession,
  getCurrentUser,
  getStoredProviderAccessToken,
  signInWithPassword,
  storeProviderSession,
  type CurrentUserProfile,
} from '../../services/serveaseProviderApi';

interface ProviderAuthContextType {
  accessToken: string | null;
  profile: CurrentUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearSessionExpired: () => void;
}

const ProviderAuthContext = createContext<ProviderAuthContextType | undefined>(undefined);

function validateProviderProfile(profile: CurrentUserProfile): string | null {
  if (profile.user.role !== 'provider' || !profile.providerProfile) {
    return 'Access restricted. This portal is for service providers only.';
  }

  if (profile.user.status !== 'active') {
    return 'This provider account is inactive. Contact ServEase support.';
  }

  return null;
}

export function ProviderAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getStoredProviderAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const nextProfile = await getCurrentUser(token);
        const validationError = validateProviderProfile(nextProfile);

        if (validationError) {
          throw new Error(validationError);
        }

        setProfile(nextProfile);
        setAccessToken(token);
        storeProviderSession(token, nextProfile);
      } catch {
        clearStoredProviderSession();
        setProfile(null);
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
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const session = await signInWithPassword(email, password);
      const nextProfile = await getCurrentUser(session.accessToken);
      const validationError = validateProviderProfile(nextProfile);

      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      setProfile(nextProfile);
      setAccessToken(session.accessToken);
      storeProviderSession(session.accessToken, nextProfile);
      setSessionExpired(false);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Incorrect email or password.',
      };
    }
  };

  const logout = () => {
    clearStoredProviderSession();
    setProfile(null);
    setAccessToken(null);
    setSessionExpired(false);
  };

  return (
    <ProviderAuthContext.Provider
      value={{
        accessToken,
        profile,
        isAuthenticated: Boolean(accessToken && profile),
        isLoading,
        sessionExpired,
        login,
        logout,
        clearSessionExpired: () => setSessionExpired(false),
      }}
    >
      {children}
    </ProviderAuthContext.Provider>
  );
}

export function useProviderAuth() {
  const context = useContext(ProviderAuthContext);

  if (context === undefined) {
    throw new Error('useProviderAuth must be used within a ProviderAuthProvider');
  }

  return context;
}
