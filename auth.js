import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config.js";
import prisma from "./server/lib/prisma.js";
import { sanitizeEmail } from "./server/utils/sanitize.js";
import { logActivity } from "./server/utils/helpers.js";

function toAuthUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    createdAt: user.createdAt?.toISOString?.() || user.createdAt || null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = sanitizeEmail(credentials?.email);
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) return null;

        return toAuthUser(user);
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      try {
        await logActivity(
          { name: user.name, username: user.username || user.email },
          "login",
          `${user.name} logged in`
        );
      } catch (err) {
        console.error("[auth] login activity failed:", err);
      }
    },
    async signOut(message) {
      const token = message?.token;
      if (!token?.id) return;
      try {
        await prisma.user.update({
          where: { id: token.id },
          data: { tokenVersion: { increment: 1 } },
        });
        await logActivity(
          { name: token.name, username: token.username || token.email },
          "logout",
          `${token.name || "User"} logged out`
        );
      } catch (err) {
        console.error("[auth] logout cleanup failed:", err);
      }
    },
  },
});
