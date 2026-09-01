import prisma from "../server/lib/prisma.js";

const users = await prisma.user.findMany({
  select: { username: true, name: true, role: true },
  orderBy: { createdAt: "asc" },
});

console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
