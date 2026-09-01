"use client";

import { createContext, useContext } from "react";
import { usePortalData } from "@/hooks/usePortalData";

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const value = usePortalData();
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}
