"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { PortalProvider } from "@/components/providers/PortalProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function ProvidersLayout({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          <PortalProvider>{children}</PortalProvider>
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}
