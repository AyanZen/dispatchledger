"use client";

import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import { initials } from "@/lib/avatar";

/**
 * The portal's top bar. Every view renders it first, so it carries the page
 * title alongside the persistent tools: franchise search, overdue count,
 * and the signed-in account.
 */
export default function PageHeader({ title, subtitle, action }) {
  const router = useRouter();
  const { currentUser, alertFranchises, search, setSearch } = usePortal();

  const alertCount = alertFranchises?.length ?? 0;

  function onSearch(value) {
    setSearch(value);
    router.push("/franchises");
  }

  return (
    <header className="topbar">
      <div className="topbar-lead">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-tools">
        <label className="topbar-search">
          <Search size={15} aria-hidden />
          <input
            type="search"
            placeholder="Search franchises…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search franchises"
          />
        </label>

        <AlertBell count={alertCount} onClick={() => router.push("/alerts")} />
        <AccountAvatar user={currentUser} onClick={() => router.push("/profile")} />
      </div>

      {action && <div className="topbar-action">{action}</div>}
    </header>
  );
}

export function AlertBell({ count, onClick }) {
  return (
    <button
      type="button"
      className="icon-pill"
      onClick={onClick}
      aria-label={
        count > 0
          ? `${count} franchise${count === 1 ? "" : "s"} past their payment term`
          : "No franchises past their payment term"
      }
      title="Overdue franchises"
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="icon-pill__dot" aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export function AccountAvatar({ user, onClick }) {
  return (
    <button
      type="button"
      className="avatar avatar--md"
      onClick={onClick}
      title={`${user?.name} — view profile`}
      aria-label={`${user?.name}, view profile`}
    >
      {initials(user?.name)}
    </button>
  );
}
