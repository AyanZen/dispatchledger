function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayStr() {
  return formatLocalDate(new Date());
}

export function monthKey(dateStr) {
  if (!dateStr) return "";
  return dateStr.slice(0, 7);
}

export function monthLabel(monthKeyStr) {
  if (!monthKeyStr) return "";
  const [year, month] = monthKeyStr.split("-").map(Number);
  if (!year || !month) return monthKeyStr;
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function currentMonthKey() {
  return monthKey(todayStr());
}

export function daysBetween(a, b) {
  const A = new Date(a + "T00:00:00");
  const B = new Date(b + "T00:00:00");
  return Math.round((B - A) / 86400000);
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return formatLocalDate(d);
}
