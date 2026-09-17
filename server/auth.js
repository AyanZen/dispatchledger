import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "./lib/prisma.js";
import { isAdminLevel, isSuperAdmin, ROLES } from "@/lib/roles.js";

export function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export function sessionUser(session) {
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    createdAt: user.createdAt || null,
  };
}

export async function requireAuth() {
  const session = await auth();
  const user = sessionUser(session);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      tokenVersion: true,
      createdAt: true,
    },
  });

  if (!dbUser || dbUser.tokenVersion !== (user.tokenVersion ?? 0)) {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  return { user: dbUser };
}

export async function requireAdmin(user) {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || !isAdminLevel(dbUser.role)) {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { user: { ...user, role: dbUser.role } };
}

export async function requireSuperAdmin(user) {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || !isSuperAdmin(dbUser.role)) {
    return { error: NextResponse.json({ error: "Super admin access required" }, { status: 403 }) };
  }

  return { user: { ...user, role: ROLES.SUPER_ADMIN } };
}
