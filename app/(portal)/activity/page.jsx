"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import ActivityLogView from "@/components/views/ActivityLogView";

export default function ActivityPage() {
  const { activityLog, users } = usePortal();
  return <ActivityLogView log={activityLog} users={users} />;
}
