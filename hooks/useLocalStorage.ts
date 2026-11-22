"use client";

import { useEffect, useState } from "react";

export function useLocalStorage(key: string, fallback: string): [string, (value: string) => void] {
  const [value, setValue] = useState(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue !== null) setValue(storedValue);
    } catch {
      // Storage can be unavailable in private browsing; keep the in-memory value.
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The control remains usable for this page view if storage is unavailable.
    }
  }, [hydrated, key, value]);

  return [value, setValue];
}
