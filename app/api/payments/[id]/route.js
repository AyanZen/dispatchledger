import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { buildPaymentNotes, validatePaymentInput } from "@/server/utils/payment.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function PATCH(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const body = await parseJson(request);
    const { amount, date, method, reference } = body || {};

    const validationError = validatePaymentInput({ amount, method, reference });
    if (validationError) return json({ error: validationError }, 400);

    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { franchise: true },
    });
    if (!existing) return json({ error: "Payment not found." }, 404);

    if (existing.orderId) {
      const order = await prisma.order.findFirst({
        where: { id: existing.orderId, franchiseId: existing.franchiseId },
      });
      if (!order) return json({ error: "Linked delivery not found." }, 404);

      const paidOnOrder = await prisma.payment.aggregate({
        where: { orderId: existing.orderId },
        _sum: { amount: true },
      });
      const otherPaid = (paidOnOrder._sum.amount || 0) - Number(existing.amount);
      const orderDue = Math.max(Number(order.amount) - otherPaid, 0);
      if (Number(amount) > orderDue + 0.01) {
        return json({
          error: `Payment exceeds this delivery's balance due (₹${orderDue.toLocaleString("en-IN")}).`,
        }, 400);
      }
    }

    const ref = (reference || "").trim();
    const notes = buildPaymentNotes(method, ref);

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount: Number(amount),
        date: date || existing.date,
        method,
        reference: ref,
        notes,
      },
    });

    await logActivity(
      auth.user,
      "edit_payment",
      `Updated ${method} payment of ₹${Number(amount).toLocaleString("en-IN")} from "${existing.franchise.name}" — ${notes}`
    );
    return json(payment);
  } catch (err) {
    console.error("[payments] update failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}

export async function DELETE(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { franchise: true },
    });
    if (!existing) return json({ error: "Payment not found." }, 404);

    await prisma.payment.delete({ where: { id } });
    await logActivity(
      auth.user,
      "delete_payment",
      `Deleted ${existing.method} payment of ₹${Number(existing.amount).toLocaleString("en-IN")} from "${existing.franchise.name}" (${existing.date})`
    );
    return json({ ok: true });
  } catch (err) {
    console.error("[payments] delete failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}
