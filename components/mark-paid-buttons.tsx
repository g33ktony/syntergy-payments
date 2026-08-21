"use client";

import { markInstallmentPaid } from "@/lib/actions";

export function MarkPaidButtons({
  installmentId,
  cashLabel,
  transferLabel,
}: {
  installmentId: string;
  cashLabel: string;
  transferLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={markInstallmentPaid.bind(null, installmentId, "CASH")}>
        <button
          type="submit"
          className="rounded-lg border border-stone-600 px-3 py-1.5 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100"
        >
          {cashLabel}
        </button>
      </form>
      <form action={markInstallmentPaid.bind(null, installmentId, "TRANSFER")}>
        <button
          type="submit"
          className="rounded-lg border border-stone-600 px-3 py-1.5 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100"
        >
          {transferLabel}
        </button>
      </form>
    </div>
  );
}
