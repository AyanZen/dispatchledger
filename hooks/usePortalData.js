"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { computeFranchiseLedger, enrichOrdersWithPayments } from "@/lib/franchiseLedger";
import { todayStr } from "@/utils/date";
import {
  authApi, franchisesApi, ordersApi, paymentsApi,
  remindersApi, usersApi, settingsApi,
} from "@/lib/api";

function applyBootstrap(data, setters) {
  setters.setFranchises(data.franchises || []);
  setters.setOrders(data.orders || []);
  setters.setPayments(data.payments || []);
  setters.setReminders(data.reminders || []);
  setters.setActivityLog(data.activityLog || []);
  setters.setSettings(data.settings || { termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true });
  setters.setUsers(data.users || []);
}

export function usePortalData() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status, update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState({ termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true });

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState(null);

  const [showAddFranchise, setShowAddFranchise] = useState(false);
  const [editFranchise, setEditFranchise] = useState(null);
  const [showAddOrderFor, setShowAddOrderFor] = useState(null);
  const [showAddPaymentFor, setShowAddPaymentFor] = useState(null);
  const [paymentForOrderId, setPaymentForOrderId] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showImportFor, setShowImportFor] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const alertFilter = searchParams.get("filter") || "all";

  const setters = {
    setFranchises, setOrders, setPayments, setReminders,
    setActivityLog, setSettings, setUsers,
  };

  const refreshData = useCallback(async () => {
    const data = await authApi.bootstrap();
    applyBootstrap(data, setters);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session?.user) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    setCurrentUser(session.user);
    setLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const data = await authApi.bootstrap();
        if (!cancelled) applyBootstrap(data, setters);
      } catch {
        /* Session is still valid; empty ledger is safer than a login loop. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  function showToast(message, variant = "success") {
    setToast({ message, variant });
    setTimeout(() => setToast(null), variant === "error" ? 4200 : 2600);
  }

  const paymentsByFranchise = useMemo(() => {
    const map = {};
    payments.forEach((p) => {
      if (!map[p.franchiseId]) map[p.franchiseId] = [];
      map[p.franchiseId].push(p);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.date < b.date ? 1 : -1))
    );
    return map;
  }, [payments]);

  const ordersByFranchise = useMemo(() => {
    const map = {};
    franchises.forEach((f) => {
      const fOrders = orders.filter((o) => o.franchiseId === f.id);
      const fPayments = payments.filter((p) => p.franchiseId === f.id);
      map[f.id] = enrichOrdersWithPayments(fOrders, fPayments, settings);
    });
    return map;
  }, [franchises, orders, payments, settings]);

  const franchiseSummaries = useMemo(() => {
    return franchises.map((f) => {
      const fOrders = ordersByFranchise[f.id] || [];
      const fPayments = paymentsByFranchise[f.id] || [];
      const ledger = computeFranchiseLedger(fOrders, fPayments, settings);
      return { ...f, ...ledger, orderCount: fOrders.length };
    });
  }, [franchises, ordersByFranchise, paymentsByFranchise, settings]);

  const alertFranchises = useMemo(() => {
    return franchiseSummaries
      .filter((f) => f.status === "overdue" || f.status === "critical")
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [franchiseSummaries]);

  const totals = useMemo(() => {
    const totalOutstanding = franchiseSummaries.reduce((s, f) => s + f.totalDue, 0);
    const totalDispatched = franchiseSummaries.reduce((s, f) => s + f.totalTaken, 0);
    const totalReceived = franchiseSummaries.reduce((s, f) => s + f.totalPaid, 0);
    const criticalCount = franchiseSummaries.filter((f) => f.status === "critical").length;
    return {
      totalDispatched,
      totalReceived,
      totalOutstanding,
      criticalCount,
      franchiseCount: franchises.length,
    };
  }, [franchiseSummaries, franchises]);

  function openAlerts(filter = "all") {
    router.push(filter === "all" ? "/alerts" : `/alerts?filter=${filter}`);
  }

  function navigateToView(nextView) {
    setSelectedFranchiseId(null);
    const routes = {
      dashboard: "/dashboard",
      franchises: "/franchises",
      alerts: "/alerts",
      activity: "/activity",
      users: "/users",
      settings: "/settings",
      profile: "/profile",
    };
    router.push(routes[nextView] || "/dashboard");
  }

  function openFranchise(id) {
    setSelectedFranchiseId(id);
    router.push(`/franchises/${id}`);
  }

  function reminderCountFor(franchiseId) {
    return reminders.filter((r) => r.franchiseId === franchiseId).length;
  }

  function lastReminderFor(franchiseId) {
    const rs = reminders.filter((r) => r.franchiseId === franchiseId).sort((a, b) => (a.date < b.date ? 1 : -1));
    return rs[0] || null;
  }

  async function handleLogout() {
    setCurrentUser(null);
    await signOut({ callbackUrl: "/login" });
  }

  async function addFranchise(data) {
    await franchisesApi.create(data);
    await refreshData();
    setShowAddFranchise(false);
    showToast("Franchise added");
  }

  async function updateFranchise(id, data) {
    await franchisesApi.update(id, data);
    await refreshData();
    setEditFranchise(null);
    showToast("Franchise updated");
  }

  async function deleteFranchise(id) {
    try {
      await franchisesApi.remove(id);
      if (selectedFranchiseId === id || pathname === `/franchises/${id}`) {
        setSelectedFranchiseId(null);
        router.push("/franchises");
      }
      await refreshData();
      showToast("Franchise deleted");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function deleteUser(id) {
    try {
      await usersApi.remove(id);
      await refreshData();
      showToast("Employee removed");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function addOrder(franchiseId, data) {
    try {
      await ordersApi.create({ franchiseId, ...data });
      await refreshData();
      setShowAddOrderFor(null);
      showToast("Delivery recorded");
    } catch (e) {
      showToast(e.message, "error");
      throw e;
    }
  }

  function openPaymentForm(franchiseId, orderId = null) {
    setShowAddPaymentFor(franchiseId);
    setPaymentForOrderId(orderId);
  }

  function closePaymentForm() {
    setShowAddPaymentFor(null);
    setPaymentForOrderId(null);
  }

  async function addPayment(franchiseId, data) {
    try {
      await paymentsApi.create({
        franchiseId,
        orderId: paymentForOrderId || undefined,
        billNo: data.billNo || undefined,
        amount: data.amount,
        date: data.date,
        method: data.method,
        reference: data.reference,
      });
      await refreshData();
      closePaymentForm();
      showToast(paymentForOrderId || data.billNo ? "Delivery payment logged" : "Payment logged");
    } catch (e) {
      showToast(e.message, "error");
      throw e;
    }
  }

  async function quickPay({ franchiseId, amount, method, reference }) {
    await paymentsApi.create({
      franchiseId,
      amount: Number(amount),
      date: todayStr(),
      method,
      reference: reference || "",
    });
    await refreshData();
    showToast("Payment logged");
  }

  async function updateOrder(id, data) {
    try {
      await ordersApi.update(id, data);
      await refreshData();
      setEditOrder(null);
      showToast("Delivery updated");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function deleteOrder(id) {
    try {
      await ordersApi.remove(id);
      await refreshData();
      showToast("Delivery deleted");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function updatePayment(id, data) {
    try {
      await paymentsApi.update(id, data);
      await refreshData();
      setEditPayment(null);
      showToast("Payment updated");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function deletePayment(id) {
    try {
      await paymentsApi.remove(id);
      await refreshData();
      showToast("Payment deleted");
    } catch (e) {
      showToast(e.message);
      throw e;
    }
  }

  async function importRecords(result, type) {
    await refreshData();
    const label = type === "deliveries" ? "deliveries" : "payments";
    const skipped = result.skipped > 0 ? ` · ${result.skipped} skipped` : "";
    showToast(`Imported ${result.imported} ${label}${skipped}`);
  }

  async function sendReminder(franchise) {
    await remindersApi.create({
      franchiseId: franchise.id,
      due: franchise.totalDue,
      daysOverdue: franchise.daysOverdue,
    });
    await refreshData();
    showToast("Reminder logged");
  }

  async function addUser(data) {
    try {
      await usersApi.create(data);
      await refreshData();
      setShowAddUser(false);
      showToast("Employee added");
    } catch (e) {
      showToast(e.message);
    }
  }

  async function saveSettings(next) {
    await settingsApi.update(next);
    setSettings(next);
    await refreshData();
    showToast("Settings saved");
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (res.user) setCurrentUser(res.user);
      if (res.tokenVersion != null) {
        await updateSession({ tokenVersion: res.tokenVersion });
      }
      showToast("Password updated");
      return null;
    } catch (e) {
      return e.message;
    }
  }

  return {
    loading,
    users,
    settings,
    currentUser,
    pathname,
    navigateToView,
    openAlerts,
    alertFilter,
    selectedFranchiseId,
    setSelectedFranchiseId,
    openFranchise,
    showAddFranchise,
    setShowAddFranchise,
    editFranchise,
    setEditFranchise,
    showAddOrderFor,
    setShowAddOrderFor,
    showAddPaymentFor,
    setShowAddPaymentFor,
    paymentForOrderId,
    openPaymentForm,
    closePaymentForm,
    editOrder,
    setEditOrder,
    editPayment,
    setEditPayment,
    showAddUser,
    setShowAddUser,
    showImportFor,
    setShowImportFor,
    search,
    setSearch,
    toast,
    showToast,
    ordersByFranchise,
    orders,
    payments,
    franchises,
    paymentsByFranchise,
    franchiseSummaries,
    alertFranchises,
    totals,
    activityLog,
    reminderCountFor,
    lastReminderFor,
    handleLogout,
    addFranchise,
    updateFranchise,
    deleteFranchise,
    addOrder,
    addPayment,
    quickPay,
    updateOrder,
    deleteOrder,
    updatePayment,
    deletePayment,
    sendReminder,
    importRecords,
    addUser,
    deleteUser,
    saveSettings,
    changePassword,
  };
}
