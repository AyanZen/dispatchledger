"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import SettingsView from "@/components/views/SettingsView";
import { isAdminLevel } from "@/lib/roles";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, saveSettings, currentUser } = usePortal();

  useEffect(() => {
    if (currentUser && !isAdminLevel(currentUser.role)) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (!isAdminLevel(currentUser?.role)) return null;

  return <SettingsView settings={settings} onSave={saveSettings} />;
}
