import prisma from "../lib/prisma.js";

async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true },
    });
  }
  return settings;
}

export async function runEmailReminders() {
  const settings = await getSettings();
  if (!settings.emailRemindersEnabled) {
    return { skipped: true, reason: "disabled" };
  }
  return { skipped: true, reason: "email_disabled" };
}
