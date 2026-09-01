import prisma from "@/server/lib/prisma.js";
import { requireAuth } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { json } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { tokenVersion: { increment: 1 } },
  });
  await logActivity(auth.user, "logout", `${auth.user.name} logged out`);
  return json({ ok: true });
}
