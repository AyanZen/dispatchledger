import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { normalizeBillPrefix, validateBillPrefix } from "@/server/utils/billNo.js";
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
  const name = trimString(body?.name, 120);
  if (!name) return json({ error: "Franchise name is required." }, 400);

  const existing = await prisma.franchise.findUnique({ where: { id } });
  if (!existing) return json({ error: "Franchise not found." }, 404);

  let billPrefix = existing.billPrefix;
  if (body?.billPrefix != null && String(body.billPrefix).trim()) {
    const prefixError = validateBillPrefix(body.billPrefix);
    if (prefixError) return json({ error: prefixError }, 400);
    billPrefix = normalizeBillPrefix(body.billPrefix);

    if (billPrefix !== existing.billPrefix) {
      const orderCount = await prisma.order.count({ where: { franchiseId: existing.id } });
      if (orderCount > 0) {
        return json({
          error: "Bill prefix cannot be changed after deliveries exist. It would break existing bill numbers.",
        }, 400);
      }
      const taken = await prisma.franchise.findFirst({
        where: { billPrefix, NOT: { id: existing.id } },
      });
      if (taken) return json({ error: `Bill prefix "${billPrefix}" is already used.` }, 409);
    }
  }

  const franchise = await prisma.franchise.update({
    where: { id },
    data: {
      name,
      billPrefix,
      contact: trimString(body?.contact, 120),
      phone: trimString(body?.phone, 40),
      email: trimString(body?.email, 120),
      address: trimString(body?.address, 500),
    },
  });

  await logActivity(auth.user, "edit_franchise", `Updated details for "${franchise.name}"`);
  return json(franchise);
}

export async function DELETE(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const { id } = await params;
  const franchise = await prisma.franchise.findUnique({ where: { id } });
  if (!franchise) return json({ error: "Franchise not found." }, 404);

  await prisma.franchise.delete({ where: { id } });
  await logActivity(auth.user, "delete_franchise", `Deleted franchise "${franchise.name}" and all related records`);
  return json({ ok: true });
}
