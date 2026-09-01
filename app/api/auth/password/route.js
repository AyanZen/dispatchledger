import bcrypt from "bcryptjs";
import prisma from "@/server/lib/prisma.js";
import { requireAuth, signToken, sanitizeUser } from "@/server/auth.js";
import { passwordLimiter } from "@/server/rateLimit.js";
import { logActivity } from "@/server/utils/helpers.js";
import { validatePassword } from "@/server/utils/password.js";
import { BCRYPT_ROUNDS } from "@/server/config/security.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function PATCH(request) {
  const limited = apiLimiter(request) || passwordLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await parseJson(request);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return json({ error: "Current and new password are required." }, 400);
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) return json({ error: passwordError }, 400);
    if (currentPassword === newPassword) {
      return json({ error: "New password must be different from the current password." }, 400);
    }

    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!user) return json({ error: "User not found." }, 401);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return json({ error: "Current password is incorrect." }, 400);

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        tokenVersion: { increment: 1 },
      },
    });

    await logActivity(auth.user, "change_password", `${user.name} changed their login password`);

    const safeUser = sanitizeUser(updated);
    const token = signToken(updated);
    return json({ ok: true, token, user: safeUser });
  } catch (err) {
    console.error("[auth] password change failed:", err);
    return json({ error: safeErrorMessage(err, "Could not update password.") }, 500);
  }
}
