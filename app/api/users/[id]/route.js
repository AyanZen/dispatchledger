import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { json } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";
import { isSuperAdmin, ROLES } from "@/lib/roles.js";

export async function DELETE(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  const { id } = await params;
  if (id === auth.user.id) {
    return json({ error: "You cannot delete your own account." }, 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return json({ error: "Employee not found." }, 404);

  if (isSuperAdmin(user.role)) {
    return json({ error: "Cannot delete the super admin account." }, 400);
  }

  if (user.role === ROLES.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: ROLES.ADMIN } });
    const actorIsSuperAdmin = isSuperAdmin(auth.user.role);
    if (!actorIsSuperAdmin && adminCount <= 1) {
      return json({ error: "Cannot delete the only admin account." }, 400);
    }
  }

  await prisma.user.delete({ where: { id } });
  await logActivity(auth.user, "delete_user", `Removed employee "${user.name}" (${user.username})`);
  return json({ ok: true });
}
