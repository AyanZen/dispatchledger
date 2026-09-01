import prisma from "../lib/prisma.js";

const DEFAULT_SETTINGS = {
  termDays: 15,
  graceDays: 5,
  reminderIntervalDays: 2,
  emailRemindersEnabled: true,
};

/** Loads the franchise, its settings, and per-bill paid totals used by import validation. */
export async function loadImportContext(franchiseId, client = prisma) {
  const franchise = await client.franchise.findUnique({ where: { id: franchiseId } });
  if (!franchise) {
    throw Object.assign(new Error("Franchise not found."), { status: 404 });
  }

  const [settings, orders, paidByOrder] = await Promise.all([
    client.settings.findUnique({ where: { id: 1 } }),
    client.order.findMany({
      where: { franchiseId },
      select: { id: true, billNo: true, amount: true },
    }),
    client.payment.groupBy({
      by: ["orderId"],
      where: { franchiseId, orderId: { not: null } },
      _sum: { amount: true },
    }),
  ]);

  const paidMap = new Map(paidByOrder.map((p) => [p.orderId, p._sum.amount || 0]));

  return {
    franchise,
    settings: settings || DEFAULT_SETTINGS,
    orders: orders.map((o) => ({
      id: o.id,
      billNo: o.billNo,
      amount: Number(o.amount),
      paid: paidMap.get(o.id) || 0,
    })),
  };
}
