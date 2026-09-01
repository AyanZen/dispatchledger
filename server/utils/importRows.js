import { normalizeBillNo } from "./billNo.js";
import { buildPaymentNotes } from "./payment.js";
import { trimString } from "./sanitize.js";

export const IMPORT_TYPES = ["deliveries", "payments"];
export const MAX_IMPORT_ROWS = 2000;

const PAYMENT_METHODS = ["Cash", "Cheque", "Online"];

const HEADER_ALIASES = {
  billNo: ["billno", "bill", "billnumber", "billnum", "invoice", "invoiceno", "invoicenumber"],
  date: ["date", "dispatchdate", "billdate", "paymentdate", "transactiondate", "paiddate"],
  amount: ["amount", "value", "total", "totalamount", "rs", "inr", "rupees"],
  materials: ["materials", "material", "items", "item", "description", "particulars", "goods"],
  termDays: ["termdays", "term", "creditdays", "days", "paymentterm", "termindays"],
  notes: ["notes", "note", "remarks", "remark", "comment", "comments"],
  method: ["method", "mode", "paymentmode", "paymentmethod", "paymenttype"],
  reference: ["reference", "ref", "refno", "referenceno", "chequeno", "cheque", "chequenumber", "transactionid", "txnid", "utr"],
};

const REQUIRED_HEADERS = {
  deliveries: ["billNo", "date", "amount"],
  payments: ["date", "amount", "method"],
};

export const TEMPLATE_COLUMNS = {
  deliveries: ["Bill No", "Date", "Amount", "Materials", "Term Days", "Notes"],
  payments: ["Date", "Amount", "Method", "Reference", "Bill No"],
};

function normalizeHeader(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Rebuilds a grid from already-normalized rows so the commit step can reuse
 * the exact same validation path as the preview step.
 */
export function rowsToGrid(type, rows) {
  const header = TEMPLATE_COLUMNS[type];
  const body = rows.map((row) => {
    const d = row?.data ?? row ?? {};
    if (type === "deliveries") {
      return [d.billNo, d.date, d.amount, d.materials, d.termDays, d.notes];
    }
    return [d.date, d.amount, d.method, d.reference, d.billNo];
  });
  return [header, ...body];
}

/** Maps spreadsheet headers to canonical field names. */
export function mapHeaders(headerRow) {
  const map = {};
  headerRow.forEach((raw, index) => {
    const key = normalizeHeader(raw);
    if (!key) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(key) && map[field] == null) {
        map[field] = index;
        return;
      }
    }
  });
  return map;
}

function isoFromParts(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;

  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Accepts ISO, day-first, and Excel serial dates; always returns YYYY-MM-DD. */
export function parseDateCell(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return isoFromParts(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const raw = String(value).trim();
  if (!raw) return null;

  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) return isoFromParts(match[1], match[2], match[3]);

  match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return isoFromParts(match[3], match[2], match[1]);

  if (/^\d{5}(\.\d+)?$/.test(raw)) {
    const serial = Number(raw);
    // Excel epoch starts 1899-12-30; 25569 shifts it to the Unix epoch.
    const utcMs = Math.round((serial - 25569) * 86400000);
    const date = new Date(utcMs);
    if (!Number.isNaN(date.getTime())) {
      return isoFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
  }

  return null;
}

export function parseAmountCell(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const cleaned = String(value).replace(/[₹$,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  if (!cleaned || !/^-?\d*\.?\d+$/.test(cleaned)) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function normalizeMethod(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (["cash", "cash payment", "by cash"].includes(raw)) return "Cash";
  if (["cheque", "check", "chq", "dd"].includes(raw)) return "Cheque";
  if (["online", "upi", "neft", "rtgs", "imps", "bank", "transfer", "banktransfer", "net banking", "netbanking"].includes(raw)) {
    return "Online";
  }
  const titled = raw.charAt(0).toUpperCase() + raw.slice(1);
  return PAYMENT_METHODS.includes(titled) ? titled : null;
}

function cellAt(row, index) {
  if (index == null) return "";
  const value = row[index];
  return value == null ? "" : value;
}

function validateDeliveryRow({ row, headers, settings, seenBillNos, existingBillNos }) {
  const errors = [];

  const billNo = normalizeBillNo(cellAt(row, headers.billNo));
  if (!billNo) {
    errors.push("Bill number is required.");
  } else if (existingBillNos.has(billNo)) {
    errors.push(`Bill number "${billNo}" already exists for this franchise.`);
  } else if (seenBillNos.has(billNo)) {
    errors.push(`Bill number "${billNo}" is duplicated in this file.`);
  }

  const date = parseDateCell(cellAt(row, headers.date));
  if (!date) errors.push("Date is missing or not a valid date (use YYYY-MM-DD or DD/MM/YYYY).");

  const amount = parseAmountCell(cellAt(row, headers.amount));
  if (amount == null) errors.push("Amount is missing or not a number.");
  else if (amount <= 0) errors.push("Amount must be greater than zero.");

  const rawTermDays = cellAt(row, headers.termDays);
  let termDays = settings.termDays;
  if (String(rawTermDays).trim() !== "") {
    const parsed = parseAmountCell(rawTermDays);
    if (parsed == null || parsed < 0) errors.push("Term days must be a positive number.");
    else termDays = Math.round(parsed);
  }

  if (billNo && errors.length === 0) seenBillNos.add(billNo);

  return {
    errors,
    data: {
      billNo,
      date,
      amount,
      termDays,
      materials: trimString(cellAt(row, headers.materials), 500),
      notes: trimString(cellAt(row, headers.notes), 1000),
    },
  };
}

function validatePaymentRow({ row, headers, orderIndex, runningPaid }) {
  const errors = [];

  const date = parseDateCell(cellAt(row, headers.date));
  if (!date) errors.push("Date is missing or not a valid date (use YYYY-MM-DD or DD/MM/YYYY).");

  const amount = parseAmountCell(cellAt(row, headers.amount));
  if (amount == null) errors.push("Amount is missing or not a number.");
  else if (amount <= 0) errors.push("Amount must be greater than zero.");

  const method = normalizeMethod(cellAt(row, headers.method));
  if (!method) errors.push("Method must be Cash, Cheque, or Online.");

  const reference = trimString(cellAt(row, headers.reference), 120) || "";
  if (method === "Cheque" && !reference) errors.push("Cheque number is required in the Reference column.");
  if (method === "Online" && !reference) errors.push("Transaction ID is required in the Reference column.");

  const billNo = normalizeBillNo(cellAt(row, headers.billNo));
  let orderId = null;

  if (billNo) {
    const order = orderIndex.get(billNo);
    if (!order) {
      errors.push(`Bill number "${billNo}" was not found for this franchise. Import deliveries first.`);
    } else {
      orderId = order.id;
      if (amount != null && amount > 0) {
        const alreadyPaid = runningPaid.get(order.id) ?? order.paid;
        const due = Math.max(order.amount - alreadyPaid, 0);
        if (amount > due + 0.01) {
          errors.push(
            `Payment exceeds the balance due on bill ${billNo} (₹${due.toLocaleString("en-IN")} remaining).`
          );
        } else {
          runningPaid.set(order.id, alreadyPaid + amount);
        }
      }
    }
  }

  return {
    errors,
    data: {
      date,
      amount,
      method,
      reference,
      billNo: billNo || "",
      orderId,
      notes: method ? buildPaymentNotes(method, reference) : "",
    },
  };
}

/**
 * Validates a parsed sheet against existing franchise data.
 * `orders` supplies bill linking and per-bill balance checks for payments.
 */
export function buildImportPreview({ type, grid, settings, orders }) {
  if (!IMPORT_TYPES.includes(type)) {
    throw Object.assign(new Error("Unknown import type."), { status: 400 });
  }
  if (grid.length === 0) {
    throw Object.assign(new Error("The file is empty."), { status: 400 });
  }

  const [headerRow, ...dataRows] = grid;
  const headers = mapHeaders(headerRow);

  const missing = REQUIRED_HEADERS[type].filter((field) => headers[field] == null);
  if (missing.length > 0) {
    const labels = { billNo: "Bill No", date: "Date", amount: "Amount", method: "Method" };
    throw Object.assign(
      new Error(
        `Missing required column(s): ${missing.map((m) => labels[m]).join(", ")}. Download the template to see the expected format.`
      ),
      { status: 400 }
    );
  }

  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw Object.assign(
      new Error(`This file has ${dataRows.length} rows. Import at most ${MAX_IMPORT_ROWS} rows at a time.`),
      { status: 400 }
    );
  }

  const existingBillNos = new Set(orders.map((o) => o.billNo).filter(Boolean));
  const orderIndex = new Map(orders.filter((o) => o.billNo).map((o) => [o.billNo, o]));
  const seenBillNos = new Set();
  const runningPaid = new Map();

  const rows = dataRows.map((row, index) => {
    const result = type === "deliveries"
      ? validateDeliveryRow({ row, headers, settings, seenBillNos, existingBillNos })
      : validatePaymentRow({ row, headers, orderIndex, runningPaid });

    return {
      line: index + 2,
      valid: result.errors.length === 0,
      errors: result.errors,
      data: result.data,
    };
  });

  const validRows = rows.filter((r) => r.valid);

  return {
    type,
    rows,
    summary: {
      total: rows.length,
      valid: validRows.length,
      invalid: rows.length - validRows.length,
      totalAmount: validRows.reduce((sum, r) => sum + (r.data.amount || 0), 0),
    },
  };
}
