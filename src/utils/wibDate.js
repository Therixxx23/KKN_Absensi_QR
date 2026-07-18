const WIB_OFFSET = 7;

export function getWIBDateString() {
  const now = new Date();
  const wibMs = now.getTime() + WIB_OFFSET * 3600 * 1000;
  const d = new Date(wibMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
