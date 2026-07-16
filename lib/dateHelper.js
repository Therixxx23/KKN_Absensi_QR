const WIB_OFFSET = 7;

export function getWIBDateParts() {
  const now = new Date();
  const wibMs = now.getTime() + WIB_OFFSET * 3600 * 1000;
  const d = new Date(wibMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
  };
}

export function getWIBDateString() {
  const p = getWIBDateParts();
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function getWIBHour() {
  return getWIBDateParts().hour;
}

export function getWIBDayUTC() {
  const p = getWIBDateParts();
  const startUtc = Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0) - WIB_OFFSET * 3600 * 1000;
  const endUtc = startUtc + 86400 * 1000 - 1;
  return {
    start: new Date(startUtc).toISOString(),
    end: new Date(endUtc).toISOString(),
  };
}
