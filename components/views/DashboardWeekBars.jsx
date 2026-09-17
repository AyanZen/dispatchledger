"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getBusinessChartData } from "@/lib/businessChart";
import { fmtMoney } from "@/utils/format";

const chartConfig = {
  dispatched: { label: "Dispatched", color: "var(--chart-1)" },
};

export default function DashboardWeekBars({ orders, payments }) {
  const data = useMemo(() => {
    const weekly = getBusinessChartData(orders, payments, "weekly");
    return weekly.slice(-7);
  }, [orders, payments]);

  const hasActivity = data.some((d) => d.dispatched > 0);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Weekly dispatched</h3>
          <p>Last seven weeks of materials sent</p>
        </div>
      </div>
      {hasActivity ? (
        <div className="chart-body">
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={data} accessibilityLayer>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => fmtMoney(Number(value))} />} />
              <Bar dataKey="dispatched" fill="var(--chart-1)" radius={8} />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="empty-state">No dispatches in the last seven weeks.</div>
      )}
    </div>
  );
}
