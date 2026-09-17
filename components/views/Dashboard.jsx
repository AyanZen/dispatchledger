"use client";

import dynamic from "next/dynamic";
import { fmtMoney } from "../../utils/format";
import { getDashboardTrends } from "@/lib/dashboardTrends";
import { useMemo } from "react";
import PageHeader from "../common/PageHeader";
import StatCard from "../common/StatCard";
import DashboardPeriodReport from "./DashboardPeriodReport";
import DashboardRail from "./DashboardRail";

const DashboardBusinessChart = dynamic(() => import("./DashboardBusinessChart"), { ssr: false });
const DashboardAgeing = dynamic(() => import("./DashboardAgeing"), { ssr: false });
const DashboardWeekBars = dynamic(() => import("./DashboardWeekBars"), { ssr: false });

export default function Dashboard({
  totals,
  orders,
  payments,
  franchises,
  franchiseSummaries,
  alertFranchises,
  activityLog,
  currentUser,
  onOpenCritical,
  onOpenAlerts,
  onOpenFranchise,
}) {
  const trends = useMemo(
    () => getDashboardTrends(orders, payments, franchises),
    [orders, payments, franchises]
  );

  const trendWindow = `Last ${trends.weeks} weeks`;

  return (
    <div className="dash-board">
      <div className="dash-main">
        <PageHeader title="Dashboard" subtitle="Where every franchise stands, right now." />

        <div className="card-grid card-grid--hero">
          <StatCard
            label="Dispatched"
            value={fmtMoney(totals.totalDispatched)}
            series={trends.dispatched.series}
            delta={trends.dispatched.delta}
            note={trendWindow}
          />
          <StatCard
            label="Received"
            value={fmtMoney(totals.totalReceived)}
            sparkTone="ok"
            series={trends.received.series}
            delta={trends.received.delta}
            note={trendWindow}
          />
          <StatCard
            label="Outstanding"
            value={fmtMoney(totals.totalOutstanding)}
            sparkTone="warn"
            series={trends.outstanding.series}
            delta={trends.outstanding.delta}
            deltaInvert
            note="Owed right now"
            tone={totals.criticalCount > 0 ? "danger" : "ink"}
            onClick={totals.criticalCount > 0 ? onOpenCritical : undefined}
          />
        </div>

        <DashboardBusinessChart orders={orders} payments={payments} />

        <div className="two-col two-col--bottom">
          <DashboardWeekBars orders={orders} payments={payments} />
          <DashboardAgeing franchiseSummaries={franchiseSummaries} onOpenAlerts={onOpenAlerts} />
        </div>

        <DashboardPeriodReport orders={orders} payments={payments} franchises={franchises} />
      </div>

      <DashboardRail
        alertFranchises={alertFranchises}
        activityLog={activityLog}
        currentUser={currentUser}
        totals={totals}
        onOpenAlerts={onOpenAlerts}
        onOpenFranchise={onOpenFranchise}
      />
    </div>
  );
}
