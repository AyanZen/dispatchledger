/**
 * Capture the portal at desktop and mobile widths for design review.
 *
 * Signs in through the login form so Auth.js session cookies are set.
 * Uses SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD (dev fallback: admin123).
 *
 *   node .impeccable/screenshot.mjs [baseUrl]
 */
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

for (const line of readFileSync(resolve(root, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const BASE = process.argv[2] || "http://localhost:3003";
const OUT = resolve(here, "shots");
mkdirSync(OUT, { recursive: true });

const { PrismaClient } = await import("@prisma/client");
const { chromium } = await import("playwright");
const { signInContext, screenshotCredentials } = await import("./playwright-login.mjs");

const prisma = new PrismaClient();
const firstFranchise = await prisma.franchise.findFirst({ select: { id: true, name: true } });
await prisma.$disconnect();

const credentials = screenshotCredentials();

const ROUTES = [
  ["dashboard", "/dashboard"],
  ["franchises", "/franchises"],
  ["franchise-detail", firstFranchise ? `/franchises/${firstFranchise.id}` : null],
  ["alerts", "/alerts"],
  ["activity", "/activity"],
  ["users", "/users"],
  ["settings", "/settings"],
  ["profile", "/profile"],
].filter(([, path]) => path);

const VIEWPORTS = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch();

async function signedInContext({ viewport, device, theme }) {
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
  return context;
}

async function hideDevOverlay(page) {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  }).catch(() => {});
}

async function settle(page, extra = 0) {
  await hideDevOverlay(page);
  await page.waitForSelector(".loading-screen", { state: "detached", timeout: 90000 }).catch(() => {});
  await page.waitForFunction(
    () => !document.querySelector(".loading-screen"),
    { timeout: 90000 }
  ).catch(() => {});
  await page.waitForSelector(".topbar, .login-card, .back-link", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2200 + extra);
}

for (const [device, viewport] of VIEWPORTS) {
  const context = await signedInContext({ viewport, device, theme: "light" });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`  [console] ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) => console.log(`  [pageerror] ${String(e).slice(0, 200)}`));

  for (const [name, path] of ROUTES) {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    // The portal shows a loading screen until bootstrap resolves; Neon can be
    // slow to wake, so wait it out rather than shooting the spinner.
    await settle(page, name === "franchise-detail" ? 2500 : 0);
    const file = resolve(OUT, `${device}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${device}/${name} → ${file}`);
  }

  await context.close();
}

// Logged-out login screen
const loginCtx = await browser.newContext({ viewport: VIEWPORTS[0][1], deviceScaleFactor: 1.5, reducedMotion: "reduce" });
const loginPage = await loginCtx.newPage();
await loginPage.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await hideDevOverlay(loginPage);
await loginPage.waitForSelector(".login-card", { timeout: 30000 });
await loginPage.waitForTimeout(1500);
await loginPage.screenshot({ path: resolve(OUT, "desktop-login.png"), fullPage: true });
console.log(`desktop/login → ${resolve(OUT, "desktop-login.png")}`);
await loginCtx.close();

await browser.close();
console.log("done");
