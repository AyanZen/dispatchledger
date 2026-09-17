import NextAuth from "next-auth";
import authConfig, { redirectIfNeeded } from "./auth.config.js";
import { loginLimiter } from "./server/rateLimit.js";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
    const limited = loginLimiter(req);
    if (limited) return limited;
  }
  return redirectIfNeeded(req);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
