import bcrypt from "bcryptjs";
import prisma from "../server/lib/prisma.js";
import { BCRYPT_ROUNDS } from "../server/config/security.js";
import { validatePassword } from "../server/utils/password.js";
import { sanitizeEmail } from "../server/utils/sanitize.js";

const identifier = process.argv[2] || "admin@dispatch.local";
const newPassword = process.argv[3] || "admin123";

const passwordError = validatePassword(newPassword);
if (passwordError) {
  console.error(`Invalid password: ${passwordError}`);
  process.exit(1);
}

const email = sanitizeEmail(identifier);
const user = email
  ? await prisma.user.findUnique({ where: { email } })
  : await prisma.user.findUnique({ where: { username: identifier } });

if (!user) {
  console.error(`User "${identifier}" not found.`);
  process.exit(1);
}

const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashed,
    tokenVersion: { increment: 1 },
  },
});

console.log(`Password reset for "${user.email}" (${user.name}, ${user.role}).`);
console.log(`Login with: ${user.email} / ${newPassword}`);
await prisma.$disconnect();
