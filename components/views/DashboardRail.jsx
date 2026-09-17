"use client";

import { useRouter } from "next/navigation";
import { fmtMoney } from "@/utils/format";
import { initials } from "@/lib/avatar";
import { roleLabel } from "@/lib/roles";

function timeLabel(timestamp) {
  try {
    return new Date(timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function DashboardRail({
  alertFranchises = [],
  activityLog = [],
  currentUser,
  totals,
  onOpenAlerts,
  onOpenFranchise,
}) {
  const router = useRouter();
  const overdue = alertFranchises.slice(0, 5);
  const recent = (activityLog || []).slice(0, 6);

  return (
    <aside className="dash-rail">
      <section className="rail-card">
        <div className="rail-card__head">
          <h3>Needs chasing</h3>
          <button type="button" className="link-btn" onClick={onOpenAlerts}>
            All alerts
          </button>
        </div>
        {overdue.length === 0 ? (
          <p className="rail-empty">Nothing past terms.</p>
        ) : (
          <ul className="rail-list">
            {overdue.map((f) => (
              <li key={f.id}>
                <button type="button" className="rail-row" onClick={() => onOpenFranchise(f.id)}>
                  <span className="avatar avatar--sm" aria-hidden>{initials(f.name)}</span>
                  <span className="rail-row__copy">
                    <span className="rail-row__name">{f.name}</span>
                    <span className="rail-row__meta">
                      {f.status === "critical" ? "Critical" : "Overdue"} · {f.daysOverdue}d
                    </span>
                  </span>
                  <span className="rail-row__value num">{fmtMoney(f.totalDue)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rail-card">
        <div className="rail-card__head">
          <h3>Latest activity</h3>
          <button type="button" className="link-btn" onClick={() => router.push("/activity")}>
            Log
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="rail-empty">No activity yet.</p>
        ) : (
          <ol className="rail-timeline">
            {recent.map((a) => (
              <li key={a.id}>
                <span className="rail-timeline__dot" aria-hidden />
                <div>
                  <p>{a.details}</p>
                  <span>{a.user} · {timeLabel(a.timestamp)}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rail-card rail-card--profile">
        <button type="button" className="rail-profile" onClick={() => router.push("/profile")}>
          <span className="avatar avatar--lg" aria-hidden>{initials(currentUser?.name)}</span>
          <span>
            <strong>{currentUser?.name}</strong>
            <em>{roleLabel(currentUser?.role)}</em>
            <small>{totals.franchiseCount} franchises on the books</small>
          </span>
        </button>
      </section>
    </aside>
  );
}
