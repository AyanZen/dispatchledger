"use client";

import {
  Package, Users, Bell, ClipboardList, Settings as SettingsIcon, LogOut, TrendingUp, X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: TrendingUp },
  { key: "franchises", href: "/franchises", label: "Franchises", icon: Package },
  { key: "alerts", href: "/alerts", label: "Alerts", icon: Bell, badgeKey: "alerts" },
  { key: "activity", href: "/activity", label: "Activity Log", icon: ClipboardList },
];

function isActive(pathname, href) {
  if (href === "/franchises") return pathname === "/franchises" || pathname.startsWith("/franchises/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  currentUser,
  onLogout,
  alertCount,
  mobileOpen,
  onClose,
  theme,
  onToggleTheme,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [...NAV_ITEMS];
  if (currentUser.role === "admin") {
    items.push({ key: "users", href: "/users", label: "Employees", icon: Users });
    items.push({ key: "settings", href: "/settings", label: "Settings", icon: SettingsIcon });
  }

  function navigate(href) {
    router.push(href);
    onClose?.();
  }

  return (
    <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
      <div className="side-top">
        <div className="side-mark">DL</div>
        <div className="side-title">Dispatch Ledger</div>
        {onClose && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav>
        {items.map((it) => (
          <button
            key={it.key}
            className={`side-item ${isActive(pathname, it.href) ? "active" : ""}`}
            onClick={() => navigate(it.href)}
          >
            <it.icon size={17} />
            <span>{it.label}</span>
            {it.badgeKey === "alerts" && !!alertCount && (
              <span className="side-badge">{alertCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className={`side-user${pathname === "/profile" ? " side-user--active" : ""}`}>
        <button
          type="button"
          className="side-user-name side-user-name-btn"
          onClick={() => navigate("/profile")}
          title="View profile"
        >
          {currentUser.name}
        </button>
        <div className="side-user-role">{currentUser.role}</div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          className="btn btn-ghost btn-block"
          onClick={() => {
            onClose?.();
            onLogout();
          }}
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}
