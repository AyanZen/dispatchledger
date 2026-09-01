import bcrypt from "bcryptjs";
import prisma from "@/server/lib/prisma.js";
import { signToken, sanitizeUser } from "@/server/auth.js";
import { loginLimiter } from "@/server/rateLimit.js";
import { fetchBootstrap, logActivity } from "@/server/utils/helpers.js";
import { sanitizeUsername } from "@/server/utils/sanitize.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function POST(request) {
  const limited = apiLimiter(request) || loginLimiter(request);
  if (limited) return limited;

  try {
    const body = await parseJson(request);
    const username = sanitizeUsername(body?.username);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return json({ error: "Username and password required" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return json({ error: "Invalid username or password." }, 401);
    }

    const safeUser = sanitizeUser(user);
    const token = signToken(user);
    const data = await fetchBootstrap(user.role);

    await logActivity(safeUser, "login", `${user.name} logged in`);

    return json({ token, user: safeUser, ...data });
  } catch (err) {
    console.error("[auth] login failed:", err);
    return json({ error: safeErrorMessage(err, "Login failed.") }, 500);
  }
}
