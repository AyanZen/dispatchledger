import { requireAuth } from "@/server/auth.js";
import { fetchBootstrap } from "@/server/utils/helpers.js";
import { json } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

export async function GET(request) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const data = await fetchBootstrap(auth.user.role);
  return json(data);
}
