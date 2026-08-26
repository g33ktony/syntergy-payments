"use client";

import { useActionState } from "react";
import {
  addInstallmentReason,
  deleteInstallmentReason,
  type ActionState,
} from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { remainingAmount } from "@/lib/reasons";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

const initial: ActionState = {};

export function InstallmentReasons({
  installmentId,
  installmentAmount,
  currency,
  locale,
  reasons,
  copy,
  deletingLabel,
}: {
  installmentId: string;
  installmentAmount: number;
  currency: string;
  locale: string;
  reasons: { id: string; label: string; amount: number }[];
  copy: Dictionary["reasons"];
  deletingLabel: string;
}) {
  const [state, action, pending] = useActionState(
    addInstallmentReason.bind(null, installmentId),
    initial,
  );
  const remaining = remainingAmount(installmentAmount, reasons);

  return (
    <div className="mt-3 rounded-xl border border-stone-800 bg-stone-900/40 p-3">
      <p className="text-xs font-medium tracking-wide text-stone-400 uppercase">
        {copy.title}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {reasons.map((reason) => (
          <li
            key={reason.id}
            className="flex items-center justify-between gap-3 text-sm text-stone-200"
          >
            <span>{reason.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-stone-300">
                {formatMoney(reason.amount, currency, locale)}
              </span>
              <ConfirmDeleteButton
                label={copy.remove}
                pendingLabel={deletingLabel}
                confirmMessage={copy.removeConfirm(reason.label)}
                onDelete={deleteInstallmentReason.bind(null, reason.id)}
              />
            </span>
          </li>
        ))}
        {remaining > 0 ? (
          <li className="flex items-center justify-between gap-3 text-sm text-stone-400">
            <span>{copy.noReason}</span>
            <span className="font-mono">
              {formatMoney(remaining, currency, locale)}
            </span>
          </li>
        ) : null}
      </ul>

      {remaining > 0 ? (
        <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            name="label"
            required
            placeholder={copy.labelPlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
          <input
            name="amount"
            required
            inputMode="decimal"
            placeholder={copy.amountPlaceholder}
            className="w-28 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 font-mono text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-stone-600 px-3 py-2 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100 disabled:opacity-60"
          >
            {pending ? copy.adding : copy.add}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-stone-500">{copy.fullyAllocated}</p>
      )}

      {state.error ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
