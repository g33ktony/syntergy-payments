"use client";

import { useActionState } from "react";
import { updatePerson, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";
import type { PaymentMethod } from "@/lib/payment-method";

const initial: ActionState = {};

const fieldClass =
  "rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2";

export function PersonDetailsForm({
  personId,
  name,
  nickname,
  phone,
  howKnown,
  preferredPaymentMethod,
  bankClabe,
  notes,
  copy,
}: {
  personId: string;
  name: string;
  nickname: string;
  phone: string;
  howKnown: string;
  preferredPaymentMethod: PaymentMethod | null;
  bankClabe: string;
  notes: string;
  copy: Pick<
    Dictionary["person"],
    | "name"
    | "nickname"
    | "nicknamePlaceholder"
    | "phone"
    | "phonePlaceholder"
    | "howKnown"
    | "howKnownPlaceholder"
    | "preferredMethod"
    | "methodUnset"
    | "bankClabe"
    | "bankClabePlaceholder"
    | "notes"
    | "notesPlaceholder"
    | "save"
    | "saving"
  > & {
    cash: string;
    transfer: string;
  };
}) {
  const [state, action, pending] = useActionState(updatePerson, initial);

  return (
    <form action={action} className="mt-6 grid max-w-xl gap-4">
      <input type="hidden" name="personId" value={personId} />
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.name}
        <input name="name" required defaultValue={name} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.nickname}
        <input
          name="nickname"
          defaultValue={nickname}
          placeholder={copy.nicknamePlaceholder}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.phone}
        <input
          name="phone"
          defaultValue={phone}
          inputMode="tel"
          placeholder={copy.phonePlaceholder}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.howKnown}
        <input
          name="howKnown"
          defaultValue={howKnown}
          placeholder={copy.howKnownPlaceholder}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.preferredMethod}
        <select
          name="preferredPaymentMethod"
          defaultValue={preferredPaymentMethod ?? ""}
          className={fieldClass}
        >
          <option value="">{copy.methodUnset}</option>
          <option value="CASH">{copy.cash}</option>
          <option value="TRANSFER">{copy.transfer}</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.bankClabe}
        <input
          name="bankClabe"
          defaultValue={bankClabe}
          placeholder={copy.bankClabePlaceholder}
          className={`${fieldClass} font-mono`}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.notes}
        <textarea
          name="notes"
          defaultValue={notes}
          rows={3}
          placeholder={copy.notesPlaceholder}
          className={fieldClass}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg border border-stone-600 px-3 py-1.5 text-sm text-stone-200 hover:border-amber-200/70 hover:text-amber-100 disabled:opacity-60"
      >
        {pending ? copy.saving : copy.save}
      </button>
    </form>
  );
}
