"use client";

import { useActionState, useState } from "react";
import {
  addInstallmentReason,
  deleteInstallmentReason,
  registerInstallmentAbono,
  toggleReasonPaid,
  toggleUnassignedPaid,
  updateInstallmentReason,
  type ActionState,
} from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { buildBuckets, remainingAmount, totalPaid, UNASSIGNED_BUCKET_ID } from "@/lib/reasons";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

const initial: ActionState = {};

export function InstallmentReasons({
  installmentId,
  installmentAmount,
  currency,
  locale,
  reasons,
  unassignedPaidAmount,
  copy,
  methodLabels,
  deletingLabel,
}: {
  installmentId: string;
  installmentAmount: number;
  currency: string;
  locale: string;
  reasons: {
    id: string;
    label: string;
    amount: number;
    paidAmount: number;
    removeConfirm: string;
  }[];
  unassignedPaidAmount: number;
  copy: Omit<Dictionary["reasons"], "removeConfirm">;
  methodLabels: { CASH: string; TRANSFER: string };
  deletingLabel: string;
}) {
  const [addState, addAction, addPending] = useActionState(
    addInstallmentReason.bind(null, installmentId),
    initial,
  );
  const [abonoState, abonoAction, abonoPending] = useActionState(
    registerInstallmentAbono.bind(null, installmentId),
    initial,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, editAction, editPending] = useActionState(
    updateInstallmentReason.bind(null, editingId ?? ""),
    initial,
  );
  // Close the edit form once a save succeeds. Adjusting state during render
  // (rather than in an effect) in response to editState changing, per React's
  // guidance for resetting state when something the component is rendering
  // from has changed.
  const [seenEditState, setSeenEditState] = useState(editState);
  if (editState !== seenEditState) {
    setSeenEditState(editState);
    if (editState !== initial && !editState.error) {
      setEditingId(null);
    }
  }

  const buckets = buildBuckets(installmentAmount, reasons, unassignedPaidAmount, copy.noReason);
  const paidSoFar = totalPaid(buckets);
  const owed = Math.max(installmentAmount - paidSoFar, 0);
  const canAddReason = remainingAmount(installmentAmount, reasons) > 0;

  return (
    <details className="mt-3 rounded-xl border border-stone-800 bg-stone-900/40 p-3">
      <summary className="cursor-pointer text-xs font-medium tracking-wide text-stone-400 uppercase">
        {copy.toggle}
      </summary>

      <div className="mt-3">
        <p className="text-xs text-stone-500">
          {formatMoney(paidSoFar, currency, locale)} / {formatMoney(installmentAmount, currency, locale)}{" "}
          {copy.covered}
          {owed > 0 ? (
            <>
              {" · "}
              {copy.owedTotal} {formatMoney(owed, currency, locale)}
            </>
          ) : null}
        </p>

        <ul className="mt-2 flex flex-col gap-1.5">
          {buckets.map((bucket) => {
            const isUnassigned = bucket.id === UNASSIGNED_BUCKET_ID;
            const isPaid = bucket.paidAmount >= bucket.amount;
            const isPartial = bucket.paidAmount > 0 && !isPaid;
            const owedForBucket = bucket.amount - bucket.paidAmount;
            const toggleAction = isUnassigned
              ? toggleUnassignedPaid.bind(null, installmentId, !isPaid)
              : toggleReasonPaid.bind(null, bucket.id, !isPaid);
            const reason = reasons.find((item) => item.id === bucket.id);

            if (reason && editingId === reason.id) {
              return (
                <li key={bucket.id} className="text-sm text-stone-200">
                  <form action={editAction} className="flex flex-wrap items-center gap-2">
                    <input
                      name="label"
                      required
                      defaultValue={reason.label}
                      className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
                    />
                    <input
                      name="amount"
                      required
                      inputMode="decimal"
                      defaultValue={(reason.amount / 100).toFixed(2)}
                      className="w-28 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 font-mono text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
                    />
                    <button
                      type="submit"
                      disabled={editPending}
                      className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs text-stone-300 hover:border-amber-200/70 hover:text-amber-100 disabled:opacity-60"
                    >
                      {editPending ? copy.abonoSubmitting : copy.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:border-stone-500"
                    >
                      {copy.cancel}
                    </button>
                  </form>
                  {editState.error ? (
                    <p className="mt-1 text-xs text-red-300" role="alert">
                      {editState.error}
                    </p>
                  ) : null}
                </li>
              );
            }

            return (
              <li
                key={bucket.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-200"
              >
                <span className="flex items-center gap-2">
                  <span>{bucket.label}</span>
                  <span
                    className={
                      isPaid
                        ? "rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300"
                        : isPartial
                          ? "rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200"
                          : "rounded-full bg-stone-700/40 px-2 py-0.5 text-xs text-stone-400"
                    }
                  >
                    {isPaid ? copy.paidTag : isPartial ? copy.partialTag : copy.pendingTag}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-stone-300">
                    {formatMoney(bucket.amount, currency, locale)}
                  </span>
                  {isPartial ? (
                    <span className="font-mono text-xs text-amber-200">
                      {copy.owes} {formatMoney(owedForBucket, currency, locale)}
                    </span>
                  ) : null}
                  <form action={toggleAction}>
                    <button
                      type="submit"
                      className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-amber-200/70 hover:text-amber-100"
                    >
                      {isPaid ? copy.markPending : copy.markPaid}
                    </button>
                  </form>
                  {reason ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(reason.id)}
                        className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-amber-200/70 hover:text-amber-100"
                      >
                        {copy.edit}
                      </button>
                      <ConfirmDeleteButton
                        label={copy.remove}
                        pendingLabel={deletingLabel}
                        confirmMessage={reason.removeConfirm}
                        onDelete={deleteInstallmentReason.bind(null, reason.id)}
                      />
                    </>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>

        {canAddReason ? (
          <form action={addAction} className="mt-3 flex flex-wrap items-center gap-2">
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
              disabled={addPending}
              className="rounded-lg border border-stone-600 px-3 py-2 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100 disabled:opacity-60"
            >
              {addPending ? copy.adding : copy.add}
            </button>
          </form>
        ) : (
          <p className="mt-3 text-xs text-stone-500">{copy.fullyAllocated}</p>
        )}

        {addState.error ? (
          <p className="mt-2 text-sm text-red-300" role="alert">
            {addState.error}
          </p>
        ) : null}

        {owed > 0 ? (
          <div className="mt-4 border-t border-stone-800 pt-3">
            <p className="text-xs font-medium tracking-wide text-stone-400 uppercase">
              {copy.abonoTitle}
            </p>
            <form action={abonoAction} className="mt-2 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-xs text-stone-400">
                {copy.abonoAmountLabel}
                <input
                  name="amount"
                  required
                  inputMode="decimal"
                  placeholder={copy.amountPlaceholder}
                  className="w-28 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 font-mono text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-400">
                {copy.abonoTargetLabel}
                <select
                  name="targetId"
                  defaultValue=""
                  className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
                >
                  <option value="">{copy.abonoTargetGeneral}</option>
                  {buckets
                    .filter((bucket) => bucket.amount - bucket.paidAmount > 0)
                    .map((bucket) => (
                      <option key={bucket.id} value={bucket.id}>
                        {bucket.label} ({formatMoney(bucket.amount - bucket.paidAmount, currency, locale)})
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-stone-400">
                {copy.abonoMethodLabel}
                <select
                  name="method"
                  defaultValue=""
                  className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
                >
                  <option value="">{copy.abonoMethodUnset}</option>
                  <option value="CASH">{methodLabels.CASH}</option>
                  <option value="TRANSFER">{methodLabels.TRANSFER}</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={abonoPending}
                className="rounded-lg border border-stone-600 px-3 py-2 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100 disabled:opacity-60"
              >
                {abonoPending ? copy.abonoSubmitting : copy.abonoSubmit}
              </button>
            </form>
            {abonoState.error ? (
              <p className="mt-2 text-sm text-red-300" role="alert">
                {abonoState.error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}
