"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MotionBackground from "@/components/layout/MotionBackground";
import FranchiseForm from "@/components/forms/FranchiseForm";
import OrderForm from "@/components/forms/OrderForm";
import PaymentForm from "@/components/forms/PaymentForm";
import UserForm from "@/components/forms/UserForm";
import ImportTransactionsDialog from "@/components/franchise/ImportTransactionsDialog";
import LoadingScreen from "@/components/layout/LoadingScreen";
import MobileHeader from "@/components/layout/MobileHeader";
import Sidebar from "@/components/layout/Sidebar";
import { usePortal } from "@/components/providers/PortalProvider";
import { isAdminLevel } from "@/lib/roles";

function PortalShell({ children }) {
  const router = useRouter();
  const {
    loading,
    settings,
    currentUser,
    pathname,
    openAlerts,
    showAddFranchise,
    setShowAddFranchise,
    editFranchise,
    setEditFranchise,
    showAddOrderFor,
    setShowAddOrderFor,
    showAddPaymentFor,
    paymentForOrderId,
    openPaymentForm,
    closePaymentForm,
    ordersByFranchise,
    editOrder,
    setEditOrder,
    editPayment,
    setEditPayment,
    showAddUser,
    setShowAddUser,
    showImportFor,
    setShowImportFor,
    toast,
    showToast,
    franchiseSummaries,
    alertFranchises,
    handleLogout,
    importRecords,
    addFranchise,
    updateFranchise,
    addOrder,
    addPayment,
    quickPay,
    updateOrder,
    updatePayment,
    addUser,
  } = usePortal();

  const isAdmin = isAdminLevel(currentUser?.role);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/login");
    }
  }, [loading, currentUser, router]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="fp-app">
        <MotionBackground />
        <LoadingScreen />
      </div>
    );
  }

  if (!currentUser) return null;

  const paymentFranchise = showAddPaymentFor || editPayment
    ? franchiseSummaries.find((f) => f.id === (showAddPaymentFor || editPayment?.franchiseId))
    : null;
  const paymentOrder = showAddPaymentFor && paymentForOrderId
    ? (ordersByFranchise[showAddPaymentFor] || []).find((o) => o.id === paymentForOrderId)
    : null;
  const editPaymentOrder = editPayment?.orderId
    ? (ordersByFranchise[editPayment.franchiseId] || []).find((o) => o.id === editPayment.orderId)
    : null;
  const importFranchise = showImportFor
    ? franchiseSummaries.find((f) => f.id === showImportFor)
    : null;

  return (
    <div className="fp-app">
      <MotionBackground />
      <div className="fp-content">
        <div className="shell">
          {menuOpen && (
            <button
              type="button"
              className="sidebar-overlay sidebar-overlay--visible"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
          )}
          <MobileHeader
            menuOpen={menuOpen}
            onToggle={() => setMenuOpen((o) => !o)}
          />
          <Sidebar
            currentUser={currentUser}
            onLogout={handleLogout}
            alertCount={alertFranchises.length}
            mobileOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            franchises={franchiseSummaries}
            onPay={quickPay}
            onDeliver={(id) => setShowAddOrderFor(id)}
          />
          <main className="main view-fade" key={pathname}>
            {toast && (
              <div className={`toast toast--${toast.variant || "success"}${toast.variant === "error" ? " toast--center" : ""}`}>
                {toast.message ?? toast}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      {showAddFranchise && isAdmin && (
        <FranchiseForm onClose={() => setShowAddFranchise(false)} onSubmit={addFranchise} />
      )}
      {editFranchise && isAdmin && (
        <FranchiseForm
          initial={editFranchise}
          onClose={() => setEditFranchise(null)}
          onSubmit={(data) => updateFranchise(editFranchise.id, data)}
        />
      )}
      {showAddOrderFor && (
        <OrderForm
          settings={settings}
          franchise={franchiseSummaries.find((f) => f.id === showAddOrderFor)}
          onClose={() => setShowAddOrderFor(null)}
          onSubmit={(data) => addOrder(showAddOrderFor, data)}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
      {editOrder && (
        <OrderForm
          settings={settings}
          initial={editOrder}
          onClose={() => setEditOrder(null)}
          onSubmit={(data) => updateOrder(editOrder.id, data)}
        />
      )}
      {showAddPaymentFor && paymentFranchise && (
        <PaymentForm
          franchise={paymentFranchise}
          order={paymentOrder}
          accountOnly={!paymentForOrderId}
          onClose={closePaymentForm}
          onSubmit={(data) => addPayment(showAddPaymentFor, data)}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
      {editPayment && paymentFranchise && (
        <PaymentForm
          franchise={paymentFranchise}
          order={editPaymentOrder}
          initial={editPayment}
          onClose={() => setEditPayment(null)}
          onSubmit={(data) => updatePayment(editPayment.id, data)}
        />
      )}
      {showAddUser && (
        <UserForm onClose={() => setShowAddUser(false)} onSubmit={addUser} />
      )}
      {importFranchise && isAdmin && (
        <ImportTransactionsDialog
          franchise={importFranchise}
          onClose={() => setShowImportFor(null)}
          onImported={importRecords}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </div>
  );
}

export default function PortalLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="fp-app">
        <MotionBackground />
        <LoadingScreen />
      </div>
    }>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
