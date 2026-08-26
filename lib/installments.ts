export function installmentIndexLabel(sequence: number, total: number) {
  return `${sequence}/${total}`;
}

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

export function formatDueDate(date: Date, locale = "es-MX") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function groupBySequence<T>(
  items: T[],
  groupKey: (item: T) => string,
  sequenceOf: (item: T) => number,
): { primary: T; rest: T[] }[] {
  const order: string[] = [];
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = groupKey(item);
    if (!groups.has(key)) {
      order.push(key);
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  return order.map((key) => {
    const list = groups.get(key)!.sort((a, b) => sequenceOf(a) - sequenceOf(b));
    const [primary, ...rest] = list;
    return { primary, rest };
  });
}
