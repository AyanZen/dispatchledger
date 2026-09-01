import { requireAuth, requireAdmin } from "@/server/auth.js";
import { readSpreadsheet, stripEmptyRows } from "@/server/utils/spreadsheet.js";
import { buildImportPreview, IMPORT_TYPES } from "@/server/utils/importRows.js";
import { loadImportContext } from "@/server/utils/importService.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function POST(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");
    const type = String(form.get("type") || "");

    if (!IMPORT_TYPES.includes(type)) {
      return json({ error: "Choose whether this file contains deliveries or payments." }, 400);
    }
    if (!file || typeof file.arrayBuffer !== "function") {
      return json({ error: "Select a CSV or Excel file to import." }, 400);
    }
    if (file.size > MAX_FILE_BYTES) {
      return json({ error: "File is too large. Keep imports under 2 MB." }, 400);
    }

    const { settings, orders } = await loadImportContext(id);
    const grid = stripEmptyRows(await readSpreadsheet(file));
    const preview = buildImportPreview({ type, grid, settings, orders });

    return json(preview);
  } catch (err) {
    if (err.status) return json({ error: err.message }, err.status);
    console.error("[import] parse failed:", err);
    return json({ error: safeErrorMessage(err, "Could not read that file.") }, 500);
  }
}
