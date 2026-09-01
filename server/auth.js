import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import prisma from "./lib/prisma.js";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
}

export function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export async function requireAuth(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        tokenVersion: true,
      },
    });

    if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
      return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
    }

    return { user };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }
}

export async function requireAdmin(user) {
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { user: { ...user, role: dbUser.role } };
}
