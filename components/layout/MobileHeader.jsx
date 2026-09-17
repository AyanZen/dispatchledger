"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AccountAvatar, AlertBell } from "@/components/common/PageHeader";
import { usePortal } from "@/components/providers/PortalProvider";

export default function MobileHeader({ menuOpen, onToggle }) {
  const router = useRouter();
  const { currentUser, alertFranchises } = usePortal();

  return (
    <header className="mobile-topbar">
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="mobile-topbar-brand">
        <div className="side-mark" aria-hidden>DL</div>
        <span className="mobile-topbar-title">Dispatch Ledger</span>
      </div>
      <div className="mobile-topbar-actions">
        <AlertBell
          count={alertFranchises?.length ?? 0}
          onClick={() => router.push("/alerts")}
        />
        <AccountAvatar user={currentUser} onClick={() => router.push("/profile")} />
      </div>
    </header>
  );
}
