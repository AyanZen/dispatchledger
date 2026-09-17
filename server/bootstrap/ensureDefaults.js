import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { BCRYPT_ROUNDS } from "../config/security.js";
import { validatePassword } from "../utils/password.js";
import { sanitizeEmail } from "../utils/sanitize.js";
import { ROLES } from "../../lib/roles.js";

export async function ensureDefaultSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { termDays: 15, graceDays: 5, reminderIntervalDays: 2, emailRemindersEnabled: true },
  });
}

function resolveSuperAdminEmail() {
  const raw =
    process.env.SUPER_ADMIN_EMAIL ||
    process.env.SEED_ADMIN_EMAIL ||
    (process.env.NODE_ENV === "production" ? "" : "admin@dispatch.local");
  return sanitizeEmail(raw);
}

function resolveSuperAdminPassword() {
  return process.env.SEED_SUPER_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "";
}

export async function ensureSuperAdminUser() {
  const email = resolveSuperAdminEmail();
  if (!email) {
    console.warn(
      "[bootstrap] SUPER_ADMIN_EMAIL is not set. Set it in env vars before deploying to production."
    );
    return { created: false, reason: "no_email" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== ROLES.SUPER_ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: ROLES.SUPER_ADMIN },
      });
      console.log(`[bootstrap] Promoted "${email}" to super-admin.`);
    }
    return { created: false, reason: "exists" };
  }

  const isProduction = process.env.NODE_ENV === "production";
  const configuredPassword = resolveSuperAdminPassword();

  if (isProduction && !configuredPassword) {
    console.warn(
      "[bootstrap] No super-admin in database. Set SEED_SUPER_ADMIN_PASSWORD in env vars and redeploy."
    );
    return { created: false, reason: "no_password" };
  }

  const password = isProduction ? configuredPassword : (configuredPassword || "admin123");
  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`[bootstrap] SEED_SUPER_ADMIN_PASSWORD invalid: ${passwordError}`);
    return { created: false, reason: "invalid_password" };
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  let username = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, ".") || "superadmin";
  let candidate = username;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${username}${suffix}`;
    suffix += 1;
  }
  username = candidate;

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      name: "Super Administrator",
      role: ROLES.SUPER_ADMIN,
    },
  });

  if (isProduction) {
    console.log("[bootstrap] Created production super-admin. Change password after first login.");
  } else {
    console.log(
      `[bootstrap] Created super-admin (${email} / ${configuredPassword ? "custom password" : "admin123"}).`
    );
  }

  return { created: true };
}

export async function ensureDefaults() {
  await ensureDefaultSettings();
  return ensureSuperAdminUser();
}
