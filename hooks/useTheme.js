"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dl-theme";

/** Light is the committed world. Any leftover dark preference is cleared. */
export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem(STORAGE_KEY, "light");
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  return {
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
    isDark: false,
  };
}
