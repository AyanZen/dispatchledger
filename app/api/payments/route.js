import prisma from "@/server/lib/prisma.js";
import { requireAuth } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { buildPaymentNotes, validatePaymentInput } from "@/server/utils/payment.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { normalizeBillNo } from "@/server/utils/billNo.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

async function resolveOrderForPayment({ franchiseId, orderId, billNo }) {
  if (billNo) {
    const order = await prisma.order.findFirst({
      where: { franchiseId, billNo: normalizeBillNo(billNo) },
    });
    if (!order) {
      return {
        error: `Bill number "${normalizeBillNo(billNo)}" was not found for this franchise. Check for typos.`,
      };
    }
    if (orderId && order.id !== orderId) {
      return { error: "Bill number does not match the selected delivery." };
    }
    return { order };
  }

  if (orderId) {
    const order = await prisma.order.findFirst({ where: { id: orderId, franchiseId } });
    if (!order) return { error: "Delivery not found for this franchise." };
    return { order };
  }

  return { order: null };
}

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await parseJson(request);
    const { franchiseId, orderId, billNo, amount, date, method, reference } = body || {};

    if (!franchiseId) return json({ error: "Franchise is required." }, 400);

    const validationError = validatePaymentInput({ amount, method, reference });
    if (validationError) return json({ error: validationError }, 400);

    const franchise = await prisma.franchise.findUnique({ where: { id: franchiseId } });
    if (!franchise) return json({ error: "Franchise not found." }, 404);

    const requiresBill = Boolean(billNo || orderId);
    if (requiresBill && !billNo && !orderId) {
      return json({ error: "Bill number is required to link this payment to a delivery." }, 400);
    }

    const resolved = await resolveOrderForPayment({ franchiseId, orderId, billNo });
    if (resolved.error) return json({ error: resolved.error }, 404);

    const order = resolved.order;

    if (order) {
      const paidOnOrder = await prisma.payment.aggregate({
        where: { orderId: order.id },
        _sum: { amount: true },
      });
      const orderDue = Math.max(Number(order.amount) - (paidOnOrder._sum.amount || 0), 0);
      if (Number(amount) > orderDue + 0.01) {
        return json({
          error: `Payment exceeds this delivery's balance due (₹${orderDue.toLocaleString("en-IN")}).`,
        }, 400);
      }
    }

    const ref = (reference || "").trim();
    const notes = buildPaymentNotes(method, ref);

    const payment = await prisma.payment.create({
      data: {
        franchiseId,
        orderId: order?.id || null,
        amount: Number(amount),
        date: date || new Date().toISOString().slice(0, 10),
        method,
        reference: ref,
        notes,
        createdBy: auth.user.name,
      },
    });

    const deliveryNote = order
      ? ` for bill ${order.billNo} (₹${Number(order.amount).toLocaleString("en-IN")})`
      : "";

    await logActivity(
      auth.user,
      "add_payment",
      `Logged ${method} payment of ₹${Number(amount).toLocaleString("en-IN")} from "${franchise.name}"${deliveryNote} — ${notes}`
    );
    return json(payment, 201);
  } catch (err) {
    console.error("[payments] create failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}
