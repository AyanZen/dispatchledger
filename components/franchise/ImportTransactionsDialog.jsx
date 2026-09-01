"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import Modal from "@/components/common/Modal";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { csvLine, downloadCsv } from "@/utils/exportCsv";
import { fmtMoney } from "@/utils/format";
import { importApi } from "@/lib/api";

const PREVIEW_LIMIT = 100;

const TEMPLATES = {
  deliveries: {
    label: "Deliveries",
    columns: ["Bill No", "Date", "Amount", "Materials", "Term Days", "Notes"],
    sample: [
      ["ABC01", "2026-07-05", "25000", "Tiles, adhesive", "15", "Opening balance"],
      ["ABC02", "2026-07-19", "18500", "Fittings", "15", ""],
    ],
    hint: "One row per bill you dispatched. Bill numbers must be unique for this franchise.",
  },
  payments: {
    label: "Payments",
    columns: ["Date", "Amount", "Method", "Reference", "Bill No"],
    sample: [
      ["2026-07-20", "15000", "Online", "UTR123456", "ABC01"],
      ["2026-08-02", "10000", "Cash", "", ""],
    ],
    hint: "Method must be Cash, Cheque, or Online. Leave Bill No blank for a general account payment.",
  },
};

function previewCells(type, row) {
  if (type === "deliveries") {
    return [row.data.billNo || "—", row.data.date || "—", row.data.amount != null ? fmtMoney(row.data.amount) : "—", row.data.materials || "—"];
  }
  return [row.data.date || "—", row.data.amount != null ? fmtMoney(row.data.amount) : "—", row.data.method || "—", row.data.billNo || "Account"];
}

const PREVIEW_HEADERS = {
  deliveries: ["Bill No", "Date", "Amount", "Materials"],
  payments: ["Date", "Amount", "Method", "Bill No"],
};

export default function ImportTransactionsDialog({ franchise, onClose, onImported, onError }) {
  const [type, setType] = useState("deliveries");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const fileRef = useRef(null);

  const template = TEMPLATES[type];

  function switchType(nextType) {
    if (nextType === type) return;
    setType(nextType);
    setPreview(null);
    setFileName("");
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const content = [
      csvLine(template.columns),
      ...template.sample.map((row) => csvLine(row)),
    ].join("\r\n");
    downloadCsv(`${franchise.name}-${type}-template`, content);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(null);
    setErr("");
    setParsing(true);

    try {
      const result = await importApi.parse(franchise.id, type, file);
      setPreview(result);
      if (result.summary.valid === 0) {
        setErr("No valid rows found. Check the column names and row values below.");
      }
    } catch (error) {
      setErr(error.message);
      onError?.(error.message);
    } finally {
      setParsing(false);
    }
  }

  async function runImport() {
    if (!preview) return;
    setImporting(true);
    setErr("");

    try {
      const result = await importApi.commit(franchise.id, {
        type,
        rows: preview.rows.filter((r) => r.valid),
        skipInvalid,
      });
      await onImported(result, type);
      onClose();
    } catch (error) {
      setErr(error.message);
      onError?.(error.message);
      setImporting(false);
    }
  }

  const summary = preview?.summary;
  const invalidRows = preview?.rows.filter((r) => !r.valid) || [];
  const canImport = Boolean(summary?.valid) && !importing && !parsing;

  return (
    <Modal title={`Import past records — ${franchise.name}`} onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <label className="field-label">What does this file contain?</label>
          <div className="flex gap-2">
            {Object.entries(TEMPLATES).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={`btn ${type === key ? "btn-primary" : "btn-ghost"}`}
                onClick={() => switchType(key)}
                disabled={parsing || importing}
              >
                {value.label}
              </button>
            ))}
          </div>
          <p className="hint-text" style={{ marginTop: 6 }}>{template.hint}</p>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="size-4" />
              <span>Expected columns: <strong>{template.columns.join(", ")}</strong></span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={downloadTemplate}>
              <Download size={15} /> Download template
            </button>
          </div>
          <p className="hint-text" style={{ marginTop: 8 }}>
            Accepts .csv and .xlsx. Dates can be YYYY-MM-DD or DD/MM/YYYY. Extra columns are ignored.
          </p>
        </div>

        <div>
          <label className="field-label">Choose file</label>
          <input
            ref={fileRef}
            className="input"
            type="file"
            accept=".csv,.xlsx,.xlsm,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFile}
            disabled={parsing || importing}
          />
          {parsing && <p className="hint-text" style={{ marginTop: 6 }}>Reading {fileName}…</p>}
        </div>

        {summary && (
          <div className="rounded-2xl border p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-(--ok)" />
                <strong>{summary.valid}</strong> ready to import
              </span>
              {summary.invalid > 0 && (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-destructive" />
                  <strong>{summary.invalid}</strong> with problems
                </span>
              )}
              <span>Total: <strong>{fmtMoney(summary.totalAmount)}</strong></span>
            </div>

            {summary.invalid > 0 && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={skipInvalid}
                  onChange={(e) => setSkipInvalid(e.target.checked)}
                  disabled={importing}
                />
                Skip the rows with problems and import the rest
              </label>
            )}
          </div>
        )}

        {invalidRows.length > 0 && (
          <div className="max-h-48 overflow-auto rounded-2xl border p-3">
            <p className="mb-2 text-sm font-medium">Rows that need fixing</p>
            <ul className="space-y-1.5 text-xs">
              {invalidRows.slice(0, PREVIEW_LIMIT).map((row) => (
                <li key={row.line}>
                  <strong>Row {row.line}:</strong> {row.errors.join(" ")}
                </li>
              ))}
            </ul>
            {invalidRows.length > PREVIEW_LIMIT && (
              <p className="hint-text">…and {invalidRows.length - PREVIEW_LIMIT} more.</p>
            )}
          </div>
        )}

        {summary?.valid > 0 && (
          <div className="max-h-56 overflow-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  {PREVIEW_HEADERS[type].map((h) => <TableHead key={h}>{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.filter((r) => r.valid).slice(0, PREVIEW_LIMIT).map((row) => (
                  <TableRow key={row.line}>
                    <TableCell className="text-muted-foreground">{row.line}</TableCell>
                    {previewCells(type, row).map((cell, i) => (
                      <TableCell key={i}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {err && <div className="form-error">{err}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={importing}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={runImport} disabled={!canImport}>
            <Upload size={15} />
            {importing ? "Importing…" : summary?.valid ? `Import ${summary.valid} ${template.label.toLowerCase()}` : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
