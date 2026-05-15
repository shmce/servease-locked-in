import { useEffect, useState } from "react";

export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) {
        return defaultValue;
      }

      const parsed = JSON.parse(stored) as T;
      if (
        defaultValue &&
        typeof defaultValue === "object" &&
        !Array.isArray(defaultValue) &&
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return { ...defaultValue, ...parsed };
      }

      return parsed;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local preference persistence must never break the admin surface.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
