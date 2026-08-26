export function reasonsTotal(reasons: { amount: number }[]) {
  return reasons.reduce((sum, reason) => sum + reason.amount, 0);
}

export function remainingAmount(installmentAmount: number, reasons: { amount: number }[]) {
  return Math.max(installmentAmount - reasonsTotal(reasons), 0);
}
