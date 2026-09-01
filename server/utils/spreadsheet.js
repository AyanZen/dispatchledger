/** Reads CSV and XLSX uploads into a plain grid of cell values. */

export function parseCsv(text) {
  const source = String(text ?? "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function flattenCell(value) {
  if (value == null) return "";
  if (value instanceof Date) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text ?? "").join("");
  }
  if (value.text != null) return value.text;
  if (value.result != null) return value.result instanceof Date ? value.result : String(value.result);
  return "";
}

async function parseXlsx(buffer) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets.find((ws) => ws.rowCount > 0) || workbook.worksheets[0];
  if (!sheet) return [];

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    // ExcelJS row values are 1-indexed, so the leading slot is always empty.
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rows.push(values.map(flattenCell));
  });

  return rows;
}

export async function readSpreadsheet(file) {
  const name = String(file?.name || "").toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) {
    return parseXlsx(buffer);
  }
  if (name.endsWith(".xls")) {
    throw Object.assign(
      new Error("Legacy .xls files are not supported. Save the file as .xlsx or .csv and try again."),
      { status: 400 }
    );
  }
  return parseCsv(buffer.toString("utf8"));
}

/** Drops fully blank rows so trailing spreadsheet padding is ignored. */
export function stripEmptyRows(rows) {
  return rows.filter((row) =>
    row.some((cell) => String(cell ?? "").trim() !== "")
  );
}
