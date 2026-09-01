import prisma from "@/server/lib/prisma.js";
import { requireAuth } from "@/server/auth.js";
import { normalizeBillNo } from "@/server/utils/billNo.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function GET(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const franchiseId = searchParams.get("franchiseId");
    const billNo = normalizeBillNo(searchParams.get("billNo"));

    if (!franchiseId || !billNo) {
      return json({ error: "Franchise and bill number are required." }, 400);
    }

    const order = await prisma.order.findFirst({
      where: { franchiseId, billNo },
      include: { franchise: { select: { name: true, billPrefix: true } } },
    });

    if (!order) {
      return json({
        error: `Bill number "${billNo}" was not found for this franchise. Check for typos.`,
      }, 404);
    }

    const paidOnOrder = await prisma.payment.aggregate({
      where: { orderId: order.id },
      _sum: { amount: true },
    });
    const totalPaid = paidOnOrder._sum.amount || 0;
    const due = Math.max(Number(order.amount) - totalPaid, 0);

    return json({ order: { ...order, totalPaid, due } });
  } catch (err) {
    console.error("[orders] lookup failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}
