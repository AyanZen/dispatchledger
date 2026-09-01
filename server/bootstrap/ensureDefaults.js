import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { BCRYPT_ROUNDS } from "../config/security.js";
import { validatePassword } from "../utils/password.js";

export async function ensureDefaultSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true },
  });
}

export async function ensureAdminUser() {
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existingAdmin) {
    return { created: false, reason: "exists" };
  }

  const isProduction = process.env.NODE_ENV === "production";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (isProduction && !adminPassword) {
    console.warn(
      "[bootstrap] No admin user in database. Set SEED_ADMIN_PASSWORD in env vars and redeploy."
    );
    return { created: false, reason: "no_password" };
  }

  const password = isProduction ? adminPassword : (adminPassword || "admin123");
  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`[bootstrap] SEED_ADMIN_PASSWORD invalid: ${passwordError}`);
    return { created: false, reason: "invalid_password" };
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashed,
      name: "Administrator",
      role: "admin",
    },
  });

  if (isProduction) {
    console.log("[bootstrap] Created production admin user. Change password after first login.");
  } else {
    console.log(`[bootstrap] Created admin user (admin / ${adminPassword ? "custom password" : "admin123"}).`);
  }

  return { created: true };
}

export async function ensureDefaults() {
  await ensureDefaultSettings();
  return ensureAdminUser();
}
