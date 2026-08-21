export function splitInstallmentAmounts(totalCents: number, count: number) {
  if (count < 1) {
    throw new Error("Installment count must be at least 1");
  }
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? base + remainder : base,
  );
}

export function monthlyDueDates(firstDue: Date, count: number) {
  const start = new Date(
    Date.UTC(firstDue.getUTCFullYear(), firstDue.getUTCMonth(), firstDue.getUTCDate()),
  );
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setUTCMonth(date.getUTCMonth() + index);
    return date;
  });
}

export function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
