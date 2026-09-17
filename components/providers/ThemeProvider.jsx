"use client";

import { createContext, useContext } from "react";
import { useTheme } from "@/hooks/useTheme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const value = useTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Shared across the sidebar, top bar, mobile header and login so every
 *  toggle reflects the same state instead of drifting per instance. */
export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
