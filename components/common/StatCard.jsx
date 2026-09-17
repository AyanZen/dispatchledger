"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Sparkline from "./Sparkline";

const SPARK_COLOR = {
  ink: "var(--chart-1)",
  ok: "var(--chart-2)",
  warn: "var(--chart-3)",
  danger: "var(--chart-4)",
};

function Delta({ delta, invert }) {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) return null;

  const rounded = Math.round(delta * 10) / 10;
  const rising = rounded > 0.05;
  const falling = rounded < -0.05;
  const good = invert ? falling : rising;
  const variant = !rising && !falling ? "flat" : good ? "up" : "down";
  const Icon = rising ? ArrowUpRight : falling ? ArrowDownRight : Minus;

  return (
    <span className={`stat-delta stat-delta--${variant}`}>
      <Icon size={13} strokeWidth={2.6} aria-hidden />
      {Math.abs(rounded).toFixed(1)}%
    </span>
  );
}

export default function StatCard({
  label,
  value,
  tone = "ink",
  sparkTone,
  onClick,
  series,
  delta,
  deltaInvert = false,
  note,
}) {
  const showSpark = Array.isArray(series) && series.length > 1;
  const className = `stat-card stat-card--hero tone-${tone}${onClick ? " stat-card--clickable" : ""}`;

  const body = (
    <>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <div className="stat-foot">
          <Delta delta={delta} invert={deltaInvert} />
          {note && <span className="stat-note">{note}</span>}
        </div>
      </div>
      {showSpark && (
        <Sparkline
          className="stat-spark"
          series={series}
          color={SPARK_COLOR[sparkTone || tone] || SPARK_COLOR.ink}
          width={96}
          height={56}
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
