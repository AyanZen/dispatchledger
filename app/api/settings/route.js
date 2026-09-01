import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function GET(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true },
    });
  }
  return json(settings);
}

export async function PATCH(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const body = await parseJson(request);
  const { termDays, graceDays, reminderIntervalDays, emailRemindersEnabled } = body || {};
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      termDays: Number(termDays),
      graceDays: Number(graceDays),
      reminderIntervalDays: Number(reminderIntervalDays ?? 2),
      emailRemindersEnabled: emailRemindersEnabled !== false,
    },
    create: {
      termDays: Number(termDays),
      graceDays: Number(graceDays),
      reminderIntervalDays: Number(reminderIntervalDays ?? 2),
      emailRemindersEnabled: emailRemindersEnabled !== false,
    },
  });

  await logActivity(
    auth.user,
    "update_settings",
    `Updated payment term to ${settings.termDays}d, grace ${settings.graceDays}d, email reminders every ${settings.reminderIntervalDays}d`
  );
  return json(settings);
}
