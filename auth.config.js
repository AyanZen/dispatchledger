/**
 * Edge-safe Auth.js config. No Prisma, bcrypt, or Node-only imports —
 * middleware reads the session cookie with this file only.
 */
import { NextResponse } from "next/server";

const PUBLIC_PAGES = new Set(["/login"]);
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/cron",
];

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default {
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.tokenVersion = user.tokenVersion ?? 0;
        token.createdAt = user.createdAt;
      }
      if (trigger === "update" && session) {
        if (session.tokenVersion != null) token.tokenVersion = session.tokenVersion;
        if (session.role) token.role = session.role;
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.tokenVersion = token.tokenVersion ?? 0;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (isPublicApi(pathname) || PUBLIC_PAGES.has(pathname)) return true;
      if (pathname.startsWith("/api/")) return true;
      return !!auth?.user;
    },
  },
};

export function redirectIfNeeded(req) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}
