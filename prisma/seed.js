import { ensureDefaults } from "../server/bootstrap/ensureDefaults.js";
import prisma from "../server/lib/prisma.js";

async function main() {
  const result = await ensureDefaults();
  if (result.reason === "exists") {
    console.log("Seed skipped: super-admin already exists for SUPER_ADMIN_EMAIL.");
  } else if (result.created) {
    console.log("Seed complete: super-admin created.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
