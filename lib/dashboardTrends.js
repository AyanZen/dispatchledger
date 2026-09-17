import { getBusinessChartData } from "./businessChart";

const WINDOW = 12;
const HALF = 6;

function sum(values) {
  return values.reduce((total, n) => total + (Number(n) || 0), 0);
}

/** Percent change between two halves of the window. Null when there is no
 *  earlier figure to compare against, so the card can stay silent instead of
 *  claiming an infinite rise. */
function halfOverHalf(series) {
  const recent = sum(series.slice(-HALF));
  const earlier = sum(series.slice(0, HALF));
  if (earlier <= 0) return null;
  return ((recent - earlier) / earlier) * 100;
}

/**
 * Twelve weekly points per dashboard metric, plus the change across the window.
 * Everything is derived from the same orders and payments the totals use, so a
 * sparkline never shows a shape the numbers above it contradict.
 */
export function getDashboardTrends(orders = [], payments = [], franchises = []) {
  const buckets = getBusinessChartData(orders, payments, "weekly");
  const dispatched = buckets.map((b) => b.dispatched);
  const received = buckets.map((b) => b.received);

  const windowStart = buckets[0]?.key;
  const openingBalance = windowStart
    ? sum(orders.filter((o) => o.date < windowStart).map((o) => o.amount)) -
      sum(payments.filter((p) => p.date < windowStart).map((p) => p.amount))
    : 0;

  let running = openingBalance;
  const outstanding = buckets.map((_, i) => {
    running += dispatched[i] - received[i];
    return Math.max(running, 0);
  });

  const openOfWindow = outstanding[0] ?? 0;
  const closeOfWindow = outstanding[outstanding.length - 1] ?? 0;

  const franchiseCounts = buckets.map((b, i) => {
    const cutoff = buckets[i + 1]?.key;
    return franchises.filter((f) => {
      const created = String(f.createdAt || "").slice(0, 10);
      if (!created) return true;
      return !cutoff || created < cutoff;
    }).length;
  });

  return {
    weeks: WINDOW,
    dispatched: { series: dispatched, delta: halfOverHalf(dispatched) },
    received: { series: received, delta: halfOverHalf(received) },
    outstanding: {
      series: outstanding,
      delta: openOfWindow > 0 ? ((closeOfWindow - openOfWindow) / openOfWindow) * 100 : null,
    },
    franchises: {
      series: franchiseCounts,
      added: (franchiseCounts[franchiseCounts.length - 1] ?? 0) - (franchiseCounts[0] ?? 0),
    },
  };
}

/** Outstanding split by how late it is — the ageing donut's source. */
export function getAgeingBuckets(franchiseSummaries = []) {
  const totals = { current: 0, overdue: 0, critical: 0 };

  franchiseSummaries.forEach((f) => {
    const due = Number(f.totalDue) || 0;
    if (due <= 0) return;
    if (f.status === "critical") totals.critical += due;
    else if (f.status === "overdue") totals.overdue += due;
    else totals.current += due;
  });

  return [
    { key: "current", label: "Within terms", value: totals.current, color: "var(--chart-1)" },
    { key: "overdue", label: "Overdue", value: totals.overdue, color: "var(--chart-3)" },
    { key: "critical", label: "Critical", value: totals.critical, color: "var(--chart-4)" },
  ];
}
