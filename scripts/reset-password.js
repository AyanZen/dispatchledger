import bcrypt from "bcryptjs";
import prisma from "../server/lib/prisma.js";
import { BCRYPT_ROUNDS } from "../server/config/security.js";
import { validatePassword } from "../server/utils/password.js";

const username = process.argv[2] || "admin";
const newPassword = process.argv[3] || "admin123";

const passwordError = validatePassword(newPassword);
if (passwordError) {
  console.error(`Invalid password: ${passwordError}`);
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { username } });
if (!user) {
  console.error(`User "${username}" not found.`);
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

console.log(`Password reset for "${username}" (${user.name}, ${user.role}).`);
console.log(`Login with: ${username} / ${newPassword}`);
await prisma.$disconnect();
