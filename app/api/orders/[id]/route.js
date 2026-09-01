import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { trimString } from "@/server/utils/sanitize.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function PATCH(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const { id } = await params;
  const body = await parseJson(request);
  const { materials, amount, date, termDays, notes } = body || {};
  if (!amount || Number(amount) <= 0) return json({ error: "Enter a valid amount." }, 400);
  if (!date) return json({ error: "Dispatch date is required." }, 400);

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { franchise: true },
  });
  if (!existing) return json({ error: "Delivery not found." }, 404);

  const order = await prisma.order.update({
    where: { id },
    data: {
      materials: trimString(materials, 500) || existing.materials,
      amount: Number(amount),
      date,
      termDays: Number(termDays ?? existing.termDays),
      notes: trimString(notes, 1000) ?? existing.notes,
    },
  });

  await logActivity(
    auth.user,
    "edit_order",
    `Updated delivery ${existing.billNo} for "${existing.franchise.name}" — ₹${Number(amount).toLocaleString("en-IN")} on ${date}`
  );
  return json(order);
}

export async function DELETE(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const { id } = await params;
  const existing = await prisma.order.findUnique({
    where: { id },
    include: { franchise: true },
  });
  if (!existing) return json({ error: "Delivery not found." }, 404);

  await prisma.order.delete({ where: { id } });
  await logActivity(
    auth.user,
    "delete_order",
    `Deleted delivery ${existing.billNo} of ₹${Number(existing.amount).toLocaleString("en-IN")} from "${existing.franchise.name}" (${existing.date})`
  );
  return json({ ok: true });
}
