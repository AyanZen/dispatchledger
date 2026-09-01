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

    const franchise = await prisma.franchise.findUnique({ where: { id: franchiseId } });
    if (!franchise) return json({ error: "Franchise not found." }, 404);

    const existing = await prisma.order.findFirst({ where: { franchiseId, billNo } });
    if (existing) {
      return json({
        valid: false,
        exists: true,
        error: `Bill number "${billNo}" already exists for this franchise.`,
      }, 409);
    }

    return json({ valid: true, available: true, billNo });
  } catch (err) {
    console.error("[orders] check failed:", err);
    return json({ error: safeErrorMessage(err) }, 500);
  }
}
