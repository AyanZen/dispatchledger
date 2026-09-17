"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  LogOut,
  Package,
  Plus,
  Send,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { isAdminLevel, roleLabel } from "@/lib/roles";

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

function CaptureDock({ franchises, onPay, onDeliver }) {
  const [franchiseId, setFranchiseId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const owed = franchises.find((f) => f.id === franchiseId)?.totalDue ?? 0;
  const needsRef = method === "Cheque" || method === "Online";
  const canPay = Boolean(franchiseId) && Number(amount) > 0 && owed > 0 && (!needsRef || reference.trim());

  async function submitPay() {
    if (!canPay || busy) return;
    setBusy(true);
    setErr("");
    try {
      await onPay({
        franchiseId,
        amount: Number(amount),
        method,
        reference: reference.trim(),
      });
      setAmount("");
      setReference("");
    } catch (e) {
      setErr(e.message || "Could not log payment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="capture-dock">
      <p className="capture-dock__title">Record a payment</p>
      <p className="capture-dock__hint">Franchise, amount, and method — logged from here.</p>
      <label className="sr-only" htmlFor="capture-franchise">Franchise</label>
      <select
        id="capture-franchise"
        className="capture-dock__select"
        value={franchiseId}
        onChange={(e) => setFranchiseId(e.target.value)}
      >
        <option value="">Choose franchise</option>
        {franchises.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="capture-amount">Amount</label>
      <input
        id="capture-amount"
        className="capture-dock__select"
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label className="sr-only" htmlFor="capture-method">Method</label>
      <select
        id="capture-method"
        className="capture-dock__select"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option>Cash</option>
        <option>Cheque</option>
        <option>Online</option>
      </select>
      {needsRef && (
        <>
          <label className="sr-only" htmlFor="capture-ref">Reference</label>
          <input
            id="capture-ref"
            className="capture-dock__select"
            placeholder={method === "Cheque" ? "Cheque number" : "Transaction ID"}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </>
      )}
      {err && <p className="capture-dock__err">{err}</p>}
      <button
        type="button"
        className="btn btn-primary btn-block"
        disabled={!canPay || busy}
        title={!franchiseId ? "Choose a franchise" : owed <= 0 ? "Nothing outstanding" : "Log a payment"}
        onClick={submitPay}
      >
        <Send size={15} /> {busy ? "Logging…" : "Log payment"}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-block"
        disabled={!franchiseId}
        onClick={() => onDeliver(franchiseId)}
      >
        <Plus size={15} /> New delivery
      </button>
    </div>
  );
}

export default function Sidebar({
  currentUser,
  onLogout,
  alertCount,
  mobileOpen,
  onClose,
  franchises = [],
  onPay,
  onDeliver,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [...NAV_ITEMS];
  if (isAdminLevel(currentUser.role)) {
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

      <CaptureDock
        franchises={franchises}
        onPay={async (payload) => {
          onClose?.();
          await onPay?.(payload);
        }}
        onDeliver={(id) => {
          onClose?.();
          onDeliver?.(id);
        }}
      />

      <div className={`side-user${pathname === "/profile" ? " side-user--active" : ""}`}>
        <button
          type="button"
          className="side-user-name side-user-name-btn"
          onClick={() => navigate("/profile")}
          title="View profile"
        >
          {currentUser.name}
        </button>
        <div className="side-user-role">{roleLabel(currentUser.role)}</div>
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
