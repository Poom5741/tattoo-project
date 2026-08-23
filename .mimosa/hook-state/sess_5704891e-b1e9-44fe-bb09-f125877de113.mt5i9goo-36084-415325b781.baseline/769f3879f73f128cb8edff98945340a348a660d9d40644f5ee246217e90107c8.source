/**
 * Shared formatting helpers.
 *
 * `fmtThb` — format a number as Thai Baht (฿) with th-TH locale.
 * Used across pages to avoid duplicating the same function in 4 files.
 */

export function fmtThb(v: number | null): string {
  if (!v) return "—";
  return `฿${v.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
}
