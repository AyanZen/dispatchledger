"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import SettingsView from "@/components/views/SettingsView";

export default function SettingsPage() {
  const router = useRouter();
  const { settings, saveSettings, currentUser } = usePortal();

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (currentUser?.role !== "admin") return null;

  return <SettingsView settings={settings} onSave={saveSettings} />;
}
