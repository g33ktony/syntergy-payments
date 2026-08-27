"use client";

import { markInstallmentPaid } from "@/lib/actions";

function CashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9v.01M18 15v.01" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M4 7h13M17 7l-3.5-3.5M17 7l-3.5 3.5" />
      <path d="M20 17H7M7 17l3.5-3.5M7 17l3.5 3.5" />
    </svg>
  );
}

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
          title={cashLabel}
          aria-label={cashLabel}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-600 text-stone-200 hover:border-amber-200/70 hover:text-amber-100"
        >
          <CashIcon />
        </button>
      </form>
      <form action={markInstallmentPaid.bind(null, installmentId, "TRANSFER")}>
        <button
          type="submit"
          title={transferLabel}
          aria-label={transferLabel}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-600 text-stone-200 hover:border-amber-200/70 hover:text-amber-100"
        >
          <TransferIcon />
        </button>
      </form>
    </div>
  );
}
