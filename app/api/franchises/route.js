import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { normalizeBillPrefix, suggestBillPrefix, validateBillPrefix } from "@/server/utils/billNo.js";
import { trimString } from "@/server/utils/sanitize.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const body = await parseJson(request);
  const name = trimString(body?.name, 120);
  if (!name) return json({ error: "Franchise name is required." }, 400);

  const rawPrefix = body?.billPrefix?.trim() ? body.billPrefix : suggestBillPrefix(name);
  const prefixError = validateBillPrefix(rawPrefix);
  if (prefixError) return json({ error: prefixError }, 400);
  const billPrefix = normalizeBillPrefix(rawPrefix);

  const taken = await prisma.franchise.findFirst({ where: { billPrefix } });
  if (taken) return json({ error: `Bill prefix "${billPrefix}" is already used by another franchise.` }, 409);

  const franchise = await prisma.franchise.create({
    data: {
      name,
      billPrefix,
      contact: trimString(body?.contact, 120),
      phone: trimString(body?.phone, 40),
      email: trimString(body?.email, 120),
      address: trimString(body?.address, 500),
      createdBy: auth.user.name,
    },
  });

  await logActivity(auth.user, "add_franchise", `Added franchise "${franchise.name}" (bill prefix ${franchise.billPrefix})`);
  return json(franchise, 201);
}
