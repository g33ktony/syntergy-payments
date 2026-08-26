import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { InstallmentReasons } from "@/components/installment-reasons";
import { MarkPaidButtons } from "@/components/mark-paid-buttons";
import { deleteObligation } from "@/lib/actions";
import { getDictionary } from "@/lib/get-dictionary";
import { localeTag } from "@/lib/i18n";
import { formatDueDate, installmentIndexLabel, startOfUtcDay } from "@/lib/installments";
import { formatMoney } from "@/lib/money";
import { personLabel } from "@/lib/person";
import type { PaymentMethod } from "@/lib/payment-method";

type RowProps = {
  installment: {
    id: string;
    sequence: number;
    amount: number;
    dueDate: Date;
    paidAt: Date | null;
    paymentMethod?: PaymentMethod | null;
    reasons: { id: string; label: string; amount: number }[];
    obligation: {
      id: string;
      title: string;
      currency: string;
      person: { id: string; name: string; nickname?: string | null };
      installments: { paidAt: Date | null }[];
    };
  };
  showPaidAt?: boolean;
};

export async function InstallmentRow({ installment, showPaidAt }: RowProps) {
  const { locale, t } = await getDictionary();
  const tag = localeTag(locale);
  const total = installment.obligation.installments.length;
  const today = startOfUtcDay();
  const overdue = !installment.paidAt && installment.dueDate < today;
  const methodLabel =
    installment.paymentMethod === "CASH"
      ? t.method.CASH
      : installment.paymentMethod === "TRANSFER"
        ? t.method.TRANSFER
        : t.method.unknown;

  return (
    <li className="grid grid-cols-1 gap-3 border-b border-stone-800 py-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={`/people/${installment.obligation.person.id}`}
            className="font-medium text-stone-50 hover:text-amber-100"
          >
            {personLabel(installment.obligation.person)}
          </Link>
          <span className="font-mono text-sm text-amber-100">
            {formatMoney(installment.amount, installment.obligation.currency, tag)}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-400">
          {installment.obligation.title}
        </p>
        <p className="mt-1 text-xs tracking-wide text-stone-500">
          {t.row.installment} {installmentIndexLabel(installment.sequence, total)}
          {" · "}
          {overdue ? (
            <span className="text-red-300">
              {t.row.overdue} {formatDueDate(installment.dueDate, tag)}
            </span>
          ) : installment.paidAt && showPaidAt ? (
            <span>
              {t.row.paid} {formatDueDate(installment.paidAt, tag)}
              {" · "}
              {methodLabel}
            </span>
          ) : (
            <span>
              {t.row.due} {formatDueDate(installment.dueDate, tag)}
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!installment.paidAt ? (
          <MarkPaidButtons
            installmentId={installment.id}
            cashLabel={t.paid.cash}
            transferLabel={t.paid.transfer}
          />
        ) : null}
        <ConfirmDeleteButton
          label={t.row.delete}
          pendingLabel={t.row.deleting}
          confirmMessage={t.row.deleteObligationConfirm(installment.obligation.title)}
          onDelete={deleteObligation.bind(null, installment.obligation.id)}
        />
      </div>
      <div className="sm:col-span-2">
        <InstallmentReasons
          installmentId={installment.id}
          installmentAmount={installment.amount}
          currency={installment.obligation.currency}
          locale={tag}
          reasons={installment.reasons}
          copy={t.reasons}
          deletingLabel={t.row.deleting}
        />
      </div>
    </li>
  );
}
