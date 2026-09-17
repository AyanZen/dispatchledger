/**
 * Capture the portal as it will look once real transactions exist.
 *
 * The connected database currently holds franchises but no deliveries or
 * payments, so the populated states (sparklines, trend deltas, ageing donut,
 * alerts) cannot be reviewed from live data. This intercepts the bootstrap
 * response in the browser and adds generated deliveries/payments on top of the
 * real franchises. NOTHING IS WRITTEN TO THE DATABASE — the rows exist only in
 * the page under test, and only for the life of the screenshot run.
 *
 *   node .impeccable/screenshot-demo.mjs [baseUrl]
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

for (const line of readFileSync(resolve(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const BASE = process.argv[2] || "http://localhost:3001";
const OUT = resolve(here, "shots-demo");
mkdirSync(OUT, { recursive: true });

const { PrismaClient } = await import("@prisma/client");
const { chromium } = await import("playwright");
const { signInContext, screenshotCredentials } = await import("./playwright-login.mjs");

const prisma = new PrismaClient();
const admin = await prisma.user.findFirst({
  where: { role: { in: ["super-admin", "admin"] } },
  select: { username: true },
});
await prisma.$disconnect();
if (!admin) throw new Error("No admin user found in the database.");

const credentials = screenshotCredentials();

/* ── Generated ledger ─────────────────────────────────────────────────────
   A fixed seed keeps successive screenshot runs comparable. Ageing is spread
   deliberately so every band of the donut and every alert tier is exercised. */
function makeRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const DAY = 86400000;
const dayStr = (d) => new Date(d).toISOString().slice(0, 10);

function buildLedger(franchises) {
  const rng = makeRng(20260902);
  const now = Date.now();
  const orders = [];
  const payments = [];

  franchises.forEach((f, fi) => {
    const count = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i += 1) {
      // Spread deliveries across the last ten months so the 12-week
      // sparkline window and the 12-month trend chart both have shape.
      const ageDays = Math.floor(rng() * 300);
      const amount = Math.round((15000 + rng() * 235000) / 100) * 100;
      const id = `demo-o-${fi}-${i}`;
      const date = dayStr(now - ageDays * DAY);

      orders.push({
        id,
        franchiseId: f.id,
        billNo: `${f.billPrefix || "DL"}-${1000 + fi * 10 + i}`,
        materials: "Assorted pharmaceutical stock",
        amount,
        date,
        termDays: 15,
        notes: "",
        createdAt: new Date(now - ageDays * DAY).toISOString(),
        createdBy: admin.username,
      });

      // Settlement behaviour by age: old bills mostly cleared, a deliberate
      // tail left unpaid to produce overdue and critical standings.
      const roll = rng();
      let paidFraction = 0;
      let payAfter = 0;

      if (ageDays > 90) {
        paidFraction = roll < 0.85 ? 1 : roll < 0.95 ? 0.6 : 0;
        payAfter = 8 + Math.floor(rng() * 10);
      } else if (ageDays > 25) {
        paidFraction = roll < 0.55 ? 1 : roll < 0.8 ? 0.45 : 0;
        payAfter = 6 + Math.floor(rng() * 12);
      } else {
        paidFraction = roll < 0.4 ? 1 : roll < 0.6 ? 0.5 : 0;
        payAfter = Math.floor(rng() * 8);
      }

      if (paidFraction > 0) {
        const payAge = Math.max(ageDays - payAfter, 0);
        payments.push({
          id: `demo-p-${fi}-${i}`,
          orderId: id,
          franchiseId: f.id,
          amount: Math.round((amount * paidFraction) / 100) * 100,
          date: dayStr(now - payAge * DAY),
          method: ["upi", "bank", "cash", "cheque"][Math.floor(rng() * 4)],
          reference: "",
          notes: "",
          createdAt: new Date(now - payAge * DAY).toISOString(),
          createdBy: admin.username,
        });
      }
    }
  });

  return { orders, payments };
}

const browser = await chromium.launch();

const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const ROUTES = [
  ["dashboard", "/dashboard"],
  ["franchises", "/franchises"],
  ["alerts", "/alerts"],
];

let injected = 0;

for (const [device, viewport] of VIEWPORTS) {
  for (const theme of device === "desktop" ? ["light", "dark"] : ["light"]) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: device === "mobile" ? 2 : 1.5,
      isMobile: device === "mobile",
      hasTouch: device === "mobile",
      reducedMotion: "reduce",
    });

    await context.addInitScript((th) => {
      localStorage.setItem("dl-theme", th);
    }, theme);

    await signInContext(context, BASE, credentials);

    await context.route("**/api/auth/bootstrap*", async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      const { orders, payments } = buildLedger(body.franchises || []);
      injected = orders.length;
      await route.fulfill({
        response,
        body: JSON.stringify({ ...body, orders, payments }),
        headers: { ...response.headers(), "content-type": "application/json" },
      });
    });

    const page = await context.newPage();
    page.on("pageerror", (e) => console.log(`  [pageerror] ${String(e).slice(0, 180)}`));

    for (const [name, path] of ROUTES) {
      if (theme === "dark" && name !== "dashboard") continue;
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".loading-screen", { state: "detached", timeout: 60000 }).catch(() => {});
      await page.waitForSelector(".topbar", { timeout: 60000 }).catch(() => {});
      // Recharts mounts after hydration; give the donut and area chart a beat.
      await page.waitForTimeout(2200);
      const suffix = theme === "dark" ? "-dark" : "";
      const file = resolve(OUT, `${device}-${name}${suffix}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${device}/${name}${suffix} → ${file}`);
    }

    await context.close();
  }
}

await browser.close();
console.log(`done (${injected} generated deliveries per page load, none persisted)`);
