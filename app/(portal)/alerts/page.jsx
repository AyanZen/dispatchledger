"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import AlertsView from "@/components/views/AlertsView";

export default function AlertsPage() {
  const {
    alertFranchises,
    alertFilter,
    openAlerts,
    openFranchise,
    sendReminder,
    lastReminderFor,
  } = usePortal();

  return (
    <AlertsView
      alertFranchises={alertFranchises}
      filter={alertFilter}
      onClearFilter={() => openAlerts("all")}
      onOpenFranchise={openFranchise}
      onSendReminder={sendReminder}
      lastReminderFor={lastReminderFor}
    />
  );
}
