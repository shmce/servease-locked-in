import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import {
  addProviderDayOff,
  getProviderAvailability,
  getProviderProfile,
  removeProviderDayOff,
  replaceProviderAvailabilityWindows,
  updateCurrentUserProfile,
  type AvailabilityWindowInput,
  type CurrentUserProfile,
  type DayOfWeek,
  type ProviderAvailabilitySchedule,
  type ProviderProfileSnapshot,
} from "../../services/serveaseProviderApi";
import { useProviderAuth } from "./ProviderAuthContext";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  featured: boolean;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  baseRate: number;
  priceUnit: string;
  estimatedDuration: string;
  isActive: boolean;
}

interface ProviderProfile {
  businessName: string;
  bio: string;
  serviceAreas: string;
  yearsExperience: string;
}

interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface ProviderData {
  blockedDates: string[];
  portfolioItems: PortfolioItem[];
  services: Service[];
  profile: ProviderProfile;
  availability: { [key: string]: DaySchedule };
}

interface ProviderDataContextType {
  providerData: ProviderData;
  setProviderData: (data: ProviderData) => void;
  isProfileLoading: boolean;
  profileError: string | null;
  isAvailabilityLoading: boolean;
  availabilityError: string | null;
  refreshAvailability: () => Promise<void>;
  saveAvailability: (availability: { [key: string]: DaySchedule }) => Promise<void>;
  blockedDates: string[];
  addBlockedDates: (dates: string[], reason?: string | null) => Promise<void>;
  removeBlockedDate: (date: string) => Promise<void>;
  portfolioItems: PortfolioItem[];
  setPortfolioItems: (items: PortfolioItem[]) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  profile: ProviderProfile;
  updateProfile: (updates: Partial<ProviderProfile>) => Promise<void>;
}

const ProviderDataContext = createContext<ProviderDataContextType | undefined>(undefined);

const dayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const dayLabelToApiDay: Record<string, DayOfWeek> = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
};

const apiDayToDayLabel: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const defaultAvailability: { [key: string]: DaySchedule } = {
  "Monday": {
    available: true,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Tuesday": {
    available: true,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Wednesday": {
    available: true,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Thursday": {
    available: true,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Friday": {
    available: true,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Saturday": {
    available: false,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
  "Sunday": {
    available: false,
    startTime: "08:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
  },
};

const emptyProfile: ProviderProfile = {
  businessName: "",
  bio: "",
  serviceAreas: "",
  yearsExperience: "",
};

function toAvailabilityWindows(
  availability: { [key: string]: DaySchedule },
): AvailabilityWindowInput[] {
  return dayLabels.map((day) => {
    const schedule = availability[day];

    return {
      dayOfWeek: dayLabelToApiDay[day],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.available,
    };
  });
}

function applyAvailabilitySchedule(
  currentData: ProviderData,
  schedule: ProviderAvailabilitySchedule,
): ProviderData {
  const nextAvailability = { ...defaultAvailability };

  schedule.windows.forEach((window) => {
    const day = apiDayToDayLabel[window.dayOfWeek];

    if (!day) {
      return;
    }

    nextAvailability[day] = {
      ...nextAvailability[day],
      available: window.isActive,
      startTime: window.startTime,
      endTime: window.endTime,
    };
  });

  return {
    ...currentData,
    availability: nextAvailability,
    blockedDates: schedule.daysOff.map((dayOff) => dayOff.offDate),
  };
}

function applyProviderProfileSnapshot(
  currentData: ProviderData,
  snapshot: ProviderProfileSnapshot,
): ProviderData {
  return {
    ...currentData,
    portfolioItems: snapshot.portfolio.map((item, index) => ({
      id: item.id,
      title: item.caption || item.fileName || `Portfolio item ${index + 1}`,
      description: item.caption || "",
      category: item.mimeType?.startsWith("image/") ? "Image" : "Portfolio",
      imageUrl: item.fileUrl,
      featured: item.sortOrder === 0,
    })),
    services: snapshot.services.map((service) => ({
      id: service.id,
      name: service.title,
      category: "Marketplace Service",
      description: service.description || "Service details unavailable.",
      baseRate: service.price ?? 0,
      priceUnit: service.pricingMode === "hourly" ? "per hour" : "per service",
      estimatedDuration: "Duration varies",
      isActive: true,
    })),
    profile: {
      ...currentData.profile,
      businessName:
        snapshot.provider.businessName ||
        snapshot.account.fullName ||
        currentData.profile.businessName,
      bio:
        snapshot.provider.bio ||
        snapshot.provider.serviceDescription ||
        currentData.profile.bio,
      serviceAreas: snapshot.provider.serviceArea || currentData.profile.serviceAreas,
      yearsExperience:
        snapshot.provider.yearsExperience === null ||
        snapshot.provider.yearsExperience === undefined
          ? currentData.profile.yearsExperience
          : String(snapshot.provider.yearsExperience),
    },
  };
}

function providerProfileFromCurrentUser(
  fallback: ProviderProfile,
  profile: CurrentUserProfile,
): ProviderProfile {
  return {
    businessName:
      profile.providerProfile?.businessName ||
      profile.user.fullName ||
      fallback.businessName,
    bio:
      profile.providerProfile?.bio ||
      profile.providerProfile?.serviceDescription ||
      fallback.bio,
    serviceAreas: profile.providerProfile?.serviceArea || fallback.serviceAreas,
    yearsExperience:
      profile.providerProfile?.yearsExperience === null ||
      profile.providerProfile?.yearsExperience === undefined
        ? fallback.yearsExperience
        : String(profile.providerProfile.yearsExperience),
  };
}

export function ProviderDataProvider({ children }: { children: ReactNode }) {
  const {
    accessToken,
    isLoading: isAuthLoading,
    profile: authProfile,
  } = useProviderAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [providerData, setProviderData] = useState<ProviderData>({
    blockedDates: [],
    portfolioItems: [],
    services: [],
    profile: emptyProfile,
    availability: defaultAvailability,
  });

  const refreshAvailability = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await getProviderAvailability(accessToken);
      setProviderData((prev) => applyAvailabilitySchedule(prev, schedule));
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Unable to load availability.",
      );
    } finally {
      setIsAvailabilityLoading(false);
    }
  }, [accessToken]);

  const refreshProviderProfile = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const snapshot = await getProviderProfile(accessToken);
      setProviderData((prev) => applyProviderProfileSnapshot(prev, snapshot));
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Unable to load provider profile.",
      );
    } finally {
      setIsProfileLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthLoading || !accessToken) {
      return;
    }

    void refreshProviderProfile();
    void refreshAvailability();
  }, [accessToken, isAuthLoading, refreshAvailability, refreshProviderProfile]);

  const saveAvailability = async (availability: { [key: string]: DaySchedule }) => {
    setProviderData((prev) => ({
      ...prev,
      availability,
    }));

    if (!accessToken) {
      setAvailabilityError("Sign in to sync availability with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await replaceProviderAvailabilityWindows(
        accessToken,
        toAvailabilityWindows(availability),
      );
      setProviderData((prev) => applyAvailabilitySchedule(prev, schedule));
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Unable to save availability.",
      );
      throw error;
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  const addBlockedDates = async (dates: string[], reason?: string | null) => {
    setProviderData((prev) => ({
      ...prev,
      blockedDates: [...new Set([...prev.blockedDates, ...dates])],
    }));

    if (!accessToken) {
      setAvailabilityError("Sign in to sync blocked dates with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      let latestSchedule: ProviderAvailabilitySchedule | null = null;

      for (const date of dates) {
        latestSchedule = await addProviderDayOff(accessToken, date, reason);
      }

      if (latestSchedule) {
        setProviderData((prev) => applyAvailabilitySchedule(prev, latestSchedule));
      }
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Unable to save blocked dates.",
      );
      throw error;
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  const removeBlockedDate = async (date: string) => {
    setProviderData((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }));

    if (!accessToken) {
      setAvailabilityError("Sign in to sync blocked dates with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await removeProviderDayOff(accessToken, date);
      setProviderData((prev) => applyAvailabilitySchedule(prev, schedule));
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Unable to remove blocked date.",
      );
      throw error;
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProviderProfile>) => {
    const nextProfile = {
      ...providerData.profile,
      ...updates,
    };
    const yearsExperience =
      nextProfile.yearsExperience.trim() === ""
        ? null
        : Number(nextProfile.yearsExperience);

    if (yearsExperience !== null && !Number.isFinite(yearsExperience)) {
      const message = "Years of experience must be a valid number.";
      setProfileError(message);
      throw new Error(message);
    }

    if (!accessToken) {
      const message = "Sign in to sync provider profile changes with the backend.";
      setProfileError(message);
      throw new Error(message);
    }

    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const updatedProfile = await updateCurrentUserProfile(accessToken, {
        fullName:
          authProfile?.user.fullName?.trim() ||
          nextProfile.businessName.trim() ||
          "Provider",
        contactNumber: authProfile?.user.contactNumber ?? null,
        businessName: nextProfile.businessName.trim() || null,
        bio: nextProfile.bio.trim() || null,
        serviceDescription: nextProfile.bio.trim() || null,
        serviceArea: nextProfile.serviceAreas.trim() || null,
        yearsExperience,
      });

      setProviderData((prev) => ({
        ...prev,
        profile: providerProfileFromCurrentUser(nextProfile, updatedProfile),
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save provider profile.";
      setProfileError(message);
      throw error;
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <ProviderDataContext.Provider
      value={{
        providerData,
        setProviderData,
        isProfileLoading,
        profileError,
        isAvailabilityLoading,
        availabilityError,
        refreshAvailability,
        saveAvailability,
        blockedDates: providerData.blockedDates,
        addBlockedDates,
        removeBlockedDate,
        portfolioItems: providerData.portfolioItems,
        setPortfolioItems: (items) =>
          setProviderData((prev) => ({ ...prev, portfolioItems: items })),
        services: providerData.services,
        setServices: (services) =>
          setProviderData((prev) => ({ ...prev, services: services })),
        profile: providerData.profile,
        updateProfile,
      }}
    >
      {children}
    </ProviderDataContext.Provider>
  );
}

export function useProviderData() {
  const context = useContext(ProviderDataContext);
  if (context === undefined) {
    throw new Error("useProviderData must be used within a ProviderDataProvider");
  }
  return context;
}
