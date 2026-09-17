"use client";

import { useMemo } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getAgeingBuckets } from "@/lib/dashboardTrends";
import { fmtMoney } from "@/utils/format";

const chartConfig = {
  value: { label: "Outstanding" },
  current: { label: "Within terms", color: "var(--chart-1)" },
  overdue: { label: "Overdue", color: "var(--chart-3)" },
  critical: { label: "Critical", color: "var(--chart-4)" },
};

function compactMoney(n) {
  const v = Number(n) || 0;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
}

export default function DashboardAgeing({ franchiseSummaries, onOpenAlerts }) {
  const buckets = useMemo(() => getAgeingBuckets(franchiseSummaries), [franchiseSummaries]);
  const total = buckets.reduce((s, b) => s + b.value, 0);
  const data = buckets.filter((b) => b.value > 0);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Outstanding by age</h3>
          <p>How much of the balance has passed its terms</p>
        </div>
        {total > 0 && (
          <button type="button" className="link-btn" onClick={onOpenAlerts}>
            View alerts
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="empty-state">Nothing outstanding — every delivery is settled.</div>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[212px] w-full">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="label"
                    formatter={(value) => fmtMoney(Number(value))}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="63%"
                outerRadius="94%"
                paddingAngle={data.length > 1 ? 3 : 0}
                cornerRadius={8}
                strokeWidth={0}
              >
                {data.map((b) => (
                  <Cell key={b.key} fill={b.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null;
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 6}
                          className="fill-foreground"
                          style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.04em" }}
                        >
                          {compactMoney(total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 16}
                          className="fill-muted-foreground"
                          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}
                        >
                          OUTSTANDING
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="ageing-legend">
            {buckets.map((b) => (
              <li key={b.key}>
                <span className="ageing-dot" style={{ background: b.color }} aria-hidden />
                <span className="ageing-label">{b.label}</span>
                <span className="ageing-share num">
                  {total > 0 ? Math.round((b.value / total) * 100) : 0}%
                </span>
                <span className="ageing-value num">{fmtMoney(b.value)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
