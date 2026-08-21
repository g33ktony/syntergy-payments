import Link from "next/link";
import { markInstallmentPaid } from "@/lib/actions";
import { formatDueDate } from "@/lib/installments";
import { formatMoney } from "@/lib/money";
import { progressFor } from "@/lib/queries";
import { startOfUtcDay } from "@/lib/installments";

type RowProps = {
  installment: {
    id: string;
    sequence: number;
    amount: number;
    dueDate: Date;
    paidAt: Date | null;
    obligation: {
      title: string;
      currency: string;
      person: { id: string; name: string };
      installments: { paidAt: Date | null }[];
    };
  };
  showPaidAt?: boolean;
};

export function InstallmentRow({ installment, showPaidAt }: RowProps) {
  const { paidCount, total } = progressFor(installment.obligation.installments);
  const today = startOfUtcDay();
  const overdue = !installment.paidAt && installment.dueDate < today;

  return (
    <li className="grid grid-cols-1 gap-3 border-b border-stone-800 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={`/people/${installment.obligation.person.id}`}
            className="font-medium text-stone-50 hover:text-amber-100"
          >
            {installment.obligation.person.name}
          </Link>
          <span className="font-mono text-sm text-amber-100">
            {formatMoney(installment.amount, installment.obligation.currency)}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-400">
          {installment.obligation.title}
        </p>
        <p className="mt-1 text-xs tracking-wide text-stone-500">
          {paidCount}/{total}
          {" · "}
          {overdue ? (
            <span className="text-red-300">Overdue {formatDueDate(installment.dueDate)}</span>
          ) : installment.paidAt && showPaidAt ? (
            <span>Paid {formatDueDate(installment.paidAt)}</span>
          ) : (
            <span>Due {formatDueDate(installment.dueDate)}</span>
          )}
        </p>
      </div>
      {!installment.paidAt ? (
        <form action={markInstallmentPaid.bind(null, installment.id)}>
          <button
            type="submit"
            className="rounded-lg border border-stone-600 px-3 py-1.5 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100"
          >
            Mark paid
          </button>
        </form>
      ) : null}
    </li>
  );
}
