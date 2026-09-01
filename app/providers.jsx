"use client";

import { Suspense } from "react";
import { PortalProvider } from "@/components/providers/PortalProvider";

export default function ProvidersLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <PortalProvider>{children}</PortalProvider>
    </Suspense>
  );
}
