"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CHART_PERIODS, getBusinessChartData, getChartPeriodDescription } from "@/lib/businessChart";
import { fmtMoney } from "@/utils/format";

const chartConfig = {
  dispatched: { label: "Dispatched", color: "var(--chart-1)" },
  received: { label: "Received", color: "var(--chart-2)" },
};

const PERIOD_LABEL = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

function formatAxisValue(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

function TrendChart({ data, period }) {
  return (
    <>
      <div className="chart-legend">
        <span><i style={{ background: "var(--chart-1)" }} aria-hidden /> Dispatched</span>
        <span><i style={{ background: "var(--chart-2)" }} aria-hidden /> Received</span>
      </div>

      <div className="chart-body">
        <ChartContainer config={chartConfig} className="aspect-auto h-[268px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="dl-dispatched" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dl-received" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 6" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={period === "weekly" ? 24 : 12}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={54}
              tickFormatter={formatAxisValue}
              fontSize={11}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => fmtMoney(Number(value))} />}
            />
            <Area
              type="monotone"
              dataKey="dispatched"
              stroke="var(--chart-1)"
              strokeWidth={2.6}
              fill="url(#dl-dispatched)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke="var(--chart-2)"
              strokeWidth={2.6}
              fill="url(#dl-received)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </>
  );
}

export default function DashboardBusinessChart({ orders, payments }) {
  const [period, setPeriod] = useState("monthly");

  const data = useMemo(
    () => getBusinessChartData(orders, payments, period),
    [orders, payments, period]
  );

  const hasActivity = data.some((d) => d.dispatched > 0 || d.received > 0);

  return (
    <div className="panel dashboard-business-chart">
      <div className="panel-head">
        <div>
          <h3>Dispatched vs received</h3>
          <p>{getChartPeriodDescription(period)} across all franchises</p>
        </div>
        <div className="segmented-control" role="tablist" aria-label="Chart period">
          {CHART_PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={period === p}
              className={`segmented-control-btn${period === p ? " is-active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {hasActivity ? (
        <TrendChart data={data} period={period} />
      ) : (
        <div className="empty-state">
          No deliveries or payments in this period. Record a dispatch against a
          franchise and the trend appears here.
        </div>
      )}
    </div>
  );
}
