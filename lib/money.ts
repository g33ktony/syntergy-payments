export function parseAmountToCents(raw: string) {
  const normalized = raw.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function formatMoney(cents: number, currency: string, locale = "es-MX") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function defaultCurrency() {
  return process.env.DEFAULT_CURRENCY || "USD";
}
