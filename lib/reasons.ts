export const UNASSIGNED_BUCKET_ID = "unassigned";

export type ReasonBucket = {
  id: string;
  label: string;
  amount: number;
  paidAmount: number;
};

export function reasonsTotal(reasons: { amount: number }[]) {
  return reasons.reduce((sum, reason) => sum + reason.amount, 0);
}

export function remainingAmount(installmentAmount: number, reasons: { amount: number }[]) {
  return Math.max(installmentAmount - reasonsTotal(reasons), 0);
}

export function buildBuckets(
  installmentAmount: number,
  reasons: { id: string; label: string; amount: number; paidAmount: number }[],
  unassignedPaidAmount: number,
  noReasonLabel: string,
): ReasonBucket[] {
  const buckets: ReasonBucket[] = reasons.map((reason) => ({
    id: reason.id,
    label: reason.label,
    amount: reason.amount,
    paidAmount: reason.paidAmount,
  }));
  const unassigned = remainingAmount(installmentAmount, reasons);
  if (unassigned > 0) {
    buckets.push({
      id: UNASSIGNED_BUCKET_ID,
      label: noReasonLabel,
      amount: unassigned,
      paidAmount: unassignedPaidAmount,
    });
  }
  return buckets;
}

export function totalPaid(buckets: { paidAmount: number }[]) {
  return buckets.reduce((sum, bucket) => sum + bucket.paidAmount, 0);
}

export function distributeAbono(buckets: ReasonBucket[], abonoCents: number): ReasonBucket[] {
  let left = abonoCents;
  return buckets.map((bucket) => {
    if (left <= 0) {
      return bucket;
    }
    const owed = bucket.amount - bucket.paidAmount;
    if (owed <= 0) {
      return bucket;
    }
    const applied = Math.min(owed, left);
    left -= applied;
    return { ...bucket, paidAmount: bucket.paidAmount + applied };
  });
}
