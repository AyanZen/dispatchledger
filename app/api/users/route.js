import bcrypt from "bcryptjs";
import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin, sanitizeUser } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { validatePassword } from "@/server/utils/password.js";
import { sanitizeRole, sanitizeUsername, trimString } from "@/server/utils/sanitize.js";
import { BCRYPT_ROUNDS } from "@/server/config/security.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function GET(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return json(users.map(sanitizeUser));
}

export async function POST(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const body = await parseJson(request);
  const name = trimString(body?.name, 120);
  const username = sanitizeUsername(body?.username);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !username || !password) {
    return json({ error: "All fields are required." }, 400);
  }

  const passwordError = validatePassword(password);
  if (passwordError) return json({ error: passwordError }, 400);

  const roleValue = sanitizeRole(body?.role);

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return json({ error: "Username already exists" }, 409);

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      password: hashed,
      role: roleValue,
    },
  });

  await logActivity(auth.user, "add_user", `Added employee "${user.name}" (${user.role})`);
  return json(sanitizeUser(user), 201);
}
