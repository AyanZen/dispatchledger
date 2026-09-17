"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePortal } from "@/components/providers/PortalProvider";
import FranchiseDashboard from "@/components/franchise/FranchiseDashboard";
import PageHeader from "@/components/common/PageHeader";
import { isAdminLevel } from "@/lib/roles";

export default function FranchiseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const {
    loading,
    franchiseSummaries,
    ordersByFranchise,
    paymentsByFranchise,
    activityLog,
    currentUser,
    setSelectedFranchiseId,
    setEditFranchise,
    setShowAddOrderFor,
    openPaymentForm,
    setEditOrder,
    deleteFranchise,
    deleteOrder,
    setEditPayment,
    deletePayment,
    sendReminder,
    setShowImportFor,
    lastReminderFor,
    reminderCountFor,
  } = usePortal();

  const franchise = franchiseSummaries.find((f) => f.id === id);
  const isAdmin = isAdminLevel(currentUser?.role);

  useEffect(() => {
    if (id) setSelectedFranchiseId(id);
  }, [id, setSelectedFranchiseId]);

  useEffect(() => {
    if (!franchise && franchiseSummaries.length > 0) {
      router.replace("/franchises");
    }
  }, [franchise, franchiseSummaries.length, router]);

  if (!franchise) {
    return (
      <div>
        <PageHeader
          title="Franchise"
          subtitle={loading || franchiseSummaries.length === 0 ? "Loading ledger…" : "Not on the books"}
        />
      </div>
    );
  }

  return (
    <FranchiseDashboard
      franchise={franchise}
      orders={(ordersByFranchise[franchise.id] || []).sort((a, b) => (a.date < b.date ? 1 : -1))}
      payments={paymentsByFranchise[franchise.id] || []}
      activityLog={activityLog}
      isAdmin={isAdmin}
      onBack={() => router.push("/franchises")}
      onEdit={() => setEditFranchise(franchise)}
      onDelete={deleteFranchise}
      onAddOrder={() => setShowAddOrderFor(franchise.id)}
      onAddPayment={(orderId) => openPaymentForm(franchise.id, orderId ?? null)}
      onEditOrder={(order) => setEditOrder(order)}
      onDeleteOrder={deleteOrder}
      onEditPayment={(payment) => setEditPayment(payment)}
      onDeletePayment={deletePayment}
      onSendReminder={sendReminder}
      onImport={() => setShowImportFor(franchise.id)}
      lastReminderFor={lastReminderFor}
      reminderCountFor={reminderCountFor}
    />
  );
}
