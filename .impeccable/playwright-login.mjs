/**
 * Sign a Playwright context in through the real login form (Auth.js cookies).
 */
export async function signInContext(context, baseUrl, { email, password }) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".login-card", { timeout: 30000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click(".btn-primary");
  await page.waitForURL("**/dashboard", { timeout: 60000 });
  await page.close();
}

export function screenshotCredentials() {
  return {
    email:
      process.env.SUPER_ADMIN_EMAIL ||
      process.env.SEED_ADMIN_EMAIL ||
      "admin@dispatch.local",
    password:
      process.env.SEED_SUPER_ADMIN_PASSWORD ||
      process.env.SEED_ADMIN_PASSWORD ||
      "admin123",
  };
}
