import { ensureDefaults } from "../src/bootstrap/ensureDefaults.js";
import prisma from "../src/lib/prisma.js";

async function main() {
  const result = await ensureDefaults();
  if (result.reason === "exists") {
    console.log("Seed skipped: admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
