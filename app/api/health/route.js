import { json } from "@/server/http.js";

export async function GET() {
  return json({ ok: true });
}
