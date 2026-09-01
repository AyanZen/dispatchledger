export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDefaults } = await import("./server/bootstrap/ensureDefaults.js");
    try {
      await ensureDefaults();
    } catch (err) {
      console.error("[bootstrap] startup init failed:", err);
    }
  }
}
