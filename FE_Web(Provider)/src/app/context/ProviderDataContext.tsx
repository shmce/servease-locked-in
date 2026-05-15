import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  addProviderDayOff,
  getProviderAvailability,
  getStoredProviderAccessToken,
  removeProviderDayOff,
  replaceProviderAvailabilityWindows,
  type AvailabilityWindowInput,
  type DayOfWeek,
  type ProviderAvailabilitySchedule,
} from "../../services/serveaseProviderApi";

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
  languages: string[];
  facebook: string;
  instagram: string;
  website: string;
  coverPhotoUrl: string;
  profilePhotoUrl: string;
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
  updateProfile: (updates: Partial<ProviderProfile>) => void;
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

export function ProviderDataProvider({ children }: { children: ReactNode }) {
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [providerData, setProviderData] = useState<ProviderData>({
    blockedDates: ["2026-03-25", "2026-03-26"],
    portfolioItems: [
      {
        id: "1",
        title: "Modern Office Renovation",
        description: "Complete office deep cleaning and sanitization",
        category: "Commercial Cleaning",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        featured: true,
      },
      {
        id: "2",
        title: "Residential Deep Cleaning",
        description: "3-bedroom house complete cleaning service",
        category: "Residential Cleaning",
        imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        featured: false,
      },
    ],
    services: [
      {
        id: "1",
        name: "House Cleaning",
        category: "Residential",
        description: "Standard house cleaning service including all rooms",
        baseRate: 500,
        priceUnit: "per hour",
        estimatedDuration: "3-4 hours",
        isActive: true,
      },
      {
        id: "2",
        name: "Deep Cleaning",
        category: "Residential",
        description: "Thorough deep cleaning with sanitization",
        baseRate: 800,
        priceUnit: "per hour",
        estimatedDuration: "4-6 hours",
        isActive: true,
      },
      {
        id: "3",
        name: "Office Cleaning",
        category: "Commercial",
        description: "Professional office cleaning service",
        baseRate: 1200,
        priceUnit: "per hour",
        estimatedDuration: "2-3 hours",
        isActive: true,
      },
    ],
    profile: {
      businessName: "Juan's Professional Cleaning",
      bio: "With over 8 years of professional cleaning experience, I take pride in delivering exceptional service to every client.",
      serviceAreas: "Metro Manila, Philippines",
      yearsExperience: "8",
      languages: ["English", "Filipino"],
      facebook: "",
      instagram: "",
      website: "",
      coverPhotoUrl: "https://images.unsplash.com/photo-1640963269654-3fe248c5fba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzM5MzU3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      profilePhotoUrl: "https://images.unsplash.com/photo-1770392988936-dc3d8581e0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhc2lhbiUyMG1hbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzM4OTQ1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    availability: defaultAvailability,
  });

  const refreshAvailability = async () => {
    const token = getStoredProviderAccessToken();

    if (!token) {
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await getProviderAvailability(token);
      setProviderData((prev) => applyAvailabilitySchedule(prev, schedule));
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Unable to load availability.",
      );
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    void refreshAvailability();
  }, []);

  const saveAvailability = async (availability: { [key: string]: DaySchedule }) => {
    setProviderData((prev) => ({
      ...prev,
      availability,
    }));

    const token = getStoredProviderAccessToken();

    if (!token) {
      setAvailabilityError("Sign in to sync availability with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await replaceProviderAvailabilityWindows(
        token,
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

    const token = getStoredProviderAccessToken();

    if (!token) {
      setAvailabilityError("Sign in to sync blocked dates with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      let latestSchedule: ProviderAvailabilitySchedule | null = null;

      for (const date of dates) {
        latestSchedule = await addProviderDayOff(token, date, reason);
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

    const token = getStoredProviderAccessToken();

    if (!token) {
      setAvailabilityError("Sign in to sync blocked dates with the backend.");
      return;
    }

    setIsAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const schedule = await removeProviderDayOff(token, date);
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

  const updateProfile = (updates: Partial<ProviderProfile>) => {
    setProviderData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  return (
    <ProviderDataContext.Provider
      value={{
        providerData,
        setProviderData,
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
