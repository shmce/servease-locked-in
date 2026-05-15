import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
}

interface OnboardingState {
  /** Whether the current user has completed onboarding */
  onboarded: boolean;
  /** User profile data collected during onboarding */
  userProfile: UserProfile;
  /** Mark onboarding as complete */
  completeOnboarding: () => void;
  /** Store user profile from registration form */
  setUserProfile: (profile: Partial<UserProfile>) => void;
  /** Reset everything (for testing / logout) */
  resetOnboarding: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
};

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState(false);
  const [userProfile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);

  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
  }, []);

  const setUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...profile }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setOnboarded(false);
    setProfileState(DEFAULT_PROFILE);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboarded,
        userProfile,
        completeOnboarding,
        setUserProfile,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}
