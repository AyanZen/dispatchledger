"use client";

import { usePortal } from "@/components/providers/PortalProvider";
import Dashboard from "@/components/views/Dashboard";

export default function DashboardPage() {
  const { totals, orders, payments, franchises, openAlerts } = usePortal();

  return (
    <Dashboard
      totals={totals}
      orders={orders}
      payments={payments}
      franchises={franchises}
      onOpenCritical={() => openAlerts("critical")}
    />
  );
}
