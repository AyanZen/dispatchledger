import prisma from "@/server/lib/prisma.js";
import { requireAuth, requireAdmin } from "@/server/auth.js";
import { logActivity } from "@/server/utils/helpers.js";
import { buildImportPreview, IMPORT_TYPES, MAX_IMPORT_ROWS, rowsToGrid } from "@/server/utils/importRows.js";
import { loadImportContext } from "@/server/utils/importService.js";
import { parseBillSequence, suggestBillPrefix } from "@/server/utils/billNo.js";
import { safeErrorMessage } from "@/server/utils/errors.js";
import { json, parseJson } from "@/server/http.js";
import { apiLimiter } from "@/server/rateLimit.js";

const TRANSACTION_TIMEOUT_MS = 30_000;

function formatInr(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export async function POST(request, { params }) {
  const limited = apiLimiter(request);
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const admin = await requireAdmin(auth.user);
  if (admin.error) return admin.error;

  try {
    const { id } = await params;
    const body = await parseJson(request);
    const type = String(body?.type || "");
    const submitted = Array.isArray(body?.rows) ? body.rows : null;
    const skipInvalid = body?.skipInvalid !== false;

    if (!IMPORT_TYPES.includes(type)) {
      return json({ error: "Unknown import type." }, 400);
    }
    if (!submitted || submitted.length === 0) {
      return json({ error: "There are no rows to import." }, 400);
    }
    if (submitted.length > MAX_IMPORT_ROWS) {
      return json({ error: `Import at most ${MAX_IMPORT_ROWS} rows at a time.` }, 400);
    }

    // Re-validate against current data so nothing slips in between preview and commit.
    const { franchise, settings, orders } = await loadImportContext(id);
    const preview = buildImportPreview({
      type,
      grid: rowsToGrid(type, submitted),
      settings,
      orders,
    });

    const validRows = preview.rows.filter((r) => r.valid);

    if (!skipInvalid && preview.summary.invalid > 0) {
      return json({
        error: "Some rows are still invalid. Fix them or choose to skip invalid rows.",
        rows: preview.rows.filter((r) => !r.valid),
      }, 400);
    }
    if (validRows.length === 0) {
      return json({ error: "No valid rows to import." }, 400);
    }

    const imported = await prisma.$transaction(async (tx) => {
      if (type === "deliveries") {
        await tx.order.createMany({
          data: validRows.map((r) => ({
            franchiseId: id,
            billNo: r.data.billNo,
            materials: r.data.materials || "",
            amount: Number(r.data.amount),
            date: r.data.date,
            termDays: Number(r.data.termDays ?? settings.termDays),
            notes: r.data.notes || "",
            createdBy: auth.user.name,
          })),
        });

        const prefix = franchise.billPrefix || suggestBillPrefix(franchise.name);
        const highestSeq = validRows.reduce((max, r) => {
          const seq = parseBillSequence(r.data.billNo, prefix);
          return seq != null && seq > max ? seq : max;
        }, 0);

        if (highestSeq > 0) {
          await tx.franchise.update({
            where: { id },
            data: { nextBillSeq: Math.max(franchise.nextBillSeq, highestSeq + 1) },
          });
        }
      } else {
        await tx.payment.createMany({
          data: validRows.map((r) => ({
            franchiseId: id,
            orderId: r.data.orderId || null,
            amount: Number(r.data.amount),
            date: r.data.date,
            method: r.data.method,
            reference: r.data.reference || "",
            notes: r.data.notes || "",
            createdBy: auth.user.name,
          })),
        });
      }

      return validRows.length;
    }, { timeout: TRANSACTION_TIMEOUT_MS });

    const totalAmount = validRows.reduce((sum, r) => sum + Number(r.data.amount || 0), 0);
    const label = type === "deliveries" ? "deliveries" : "payments";

    await logActivity(
      auth.user,
      "import_records",
      `Imported ${imported} historical ${label} totalling ${formatInr(totalAmount)} for "${franchise.name}"`
    );

    return json({
      ok: true,
      imported,
      skipped: preview.summary.invalid,
      totalAmount,
    }, 201);
  } catch (err) {
    if (err.status) return json({ error: err.message }, err.status);
    console.error("[import] commit failed:", err);
    return json({ error: safeErrorMessage(err, "Import failed.") }, 500);
  }
}
