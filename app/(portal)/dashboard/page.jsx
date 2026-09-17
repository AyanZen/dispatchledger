"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import Dashboard from "@/components/views/Dashboard";

export default function DashboardPage() {
  const {
    totals,
    orders,
    payments,
    franchises,
    franchiseSummaries,
    alertFranchises,
    activityLog,
    currentUser,
    openAlerts,
    openFranchise,
  } = usePortal();

  return (
    <Dashboard
      totals={totals}
      orders={orders}
      payments={payments}
      franchises={franchises}
      franchiseSummaries={franchiseSummaries}
      alertFranchises={alertFranchises}
      activityLog={activityLog}
      currentUser={currentUser}
      onOpenCritical={() => openAlerts("critical")}
      onOpenAlerts={() => openAlerts("all")}
      onOpenFranchise={openFranchise}
    />
  );
}
