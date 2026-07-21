export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "--:--";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}
export function formatNumber(n) {
  return (n ?? 0).toLocaleString("en-US");
}
export function pctSafe(part, total) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0;
}

export const STATUS_LABEL = { on_target: "On target", below_target: "Below target", no_data: "No data" };
