import prisma from "@/server/lib/prisma.js";
import { requireAuth } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const body = await parseJson(request);
  const { franchiseId, date, due, daysOverdue } = body || {};
  if (!franchiseId) return json({ error: "Franchise is required." }, 400);

  const franchise = await prisma.franchise.findUnique({ where: { id: franchiseId } });

  const reminder = await prisma.reminder.create({
    data: {
      franchiseId,
      date: date || new Date().toISOString().slice(0, 10),
      by: auth.user.name,
    },
  });

  await logActivity(
    auth.user,
    "send_reminder",
    `Marked reminder sent to "${franchise?.name || "franchise"}" for ₹${Number(due || 0).toLocaleString("en-IN")} due (${daysOverdue || 0}d overdue)`
  );
  return json(reminder, 201);
}
