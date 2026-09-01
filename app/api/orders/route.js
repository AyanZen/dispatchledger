import prisma from "@/server/lib/prisma.js";
import { requireAuth } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { normalizeBillNo, parseBillSequence, suggestBillPrefix } from "@/server/utils/billNo.js";
import { trimString } from "@/server/utils/sanitize.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await parseJson(request);
    const { franchiseId, materials, amount, date, termDays, notes, billNo: rawBillNo } = body || {};
    if (!franchiseId) return json({ error: "Franchise is required." }, 400);
    if (!amount || Number(amount) <= 0) return json({ error: "Enter a valid amount." }, 400);
    if (!date) return json({ error: "Dispatch date is required." }, 400);

    const order = await prisma.$transaction(async (tx) => {
      const franchise = await tx.franchise.findUnique({ where: { id: franchiseId } });
      if (!franchise) throw Object.assign(new Error("Franchise not found."), { status: 404 });

      const billNo = normalizeBillNo(rawBillNo);
      if (!billNo) {
        throw Object.assign(new Error("Bill number is required."), { status: 400 });
      }

      const duplicate = await tx.order.findFirst({ where: { franchiseId, billNo } });
      if (duplicate) {
        throw Object.assign(
          new Error(`Bill number "${billNo}" already exists for this franchise.`),
          { status: 409 }
        );
      }

      const created = await tx.order.create({
        data: {
          franchiseId,
          billNo,
          materials: trimString(materials, 500),
          amount: Number(amount),
          date,
          termDays: Number(termDays),
          notes: trimString(notes, 1000),
          createdBy: auth.user.name,
        },
      });

      const prefix = franchise.billPrefix || suggestBillPrefix(franchise.name);
      const usedSeq = parseBillSequence(billNo, prefix);
      if (usedSeq != null) {
        await tx.franchise.update({
          where: { id: franchiseId },
          data: { nextBillSeq: Math.max(franchise.nextBillSeq, usedSeq + 1) },
        });
      }

      return { created, franchise };
    });

    await logActivity(
      auth.user,
      "add_order",
      `Recorded dispatch ${order.created.billNo} of ₹${Number(amount).toLocaleString("en-IN")} to "${order.franchise.name}" on ${date}`
    );
    return json(order.created, 201);
  } catch (err) {
    if (err.status) return json({ error: err.message }, err.status);
    console.error("[orders] create failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}
