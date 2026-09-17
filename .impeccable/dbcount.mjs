/** Report row counts for the connected database, for design-review context. */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(resolve(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { PrismaClient } = await import("@prisma/client");
const p = new PrismaClient();

console.log("franchises", await p.franchise.count());
console.log("orders    ", await p.order.count());
console.log("payments  ", await p.payment.count());
console.log("users     ", await p.user.count());

const orders = await p.order.findMany({
  take: 5,
  orderBy: { date: "desc" },
  select: { billNo: true, amount: true, date: true, termDays: true },
});
console.log("recent orders", JSON.stringify(orders, null, 1));

const payments = await p.payment.findMany({
  take: 5,
  orderBy: { date: "desc" },
  select: { amount: true, date: true, method: true },
});
console.log("recent payments", JSON.stringify(payments, null, 1));

await p.$disconnect();
