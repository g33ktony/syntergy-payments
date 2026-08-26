"use client";

import { useActionState, useState } from "react";
import { createObligation, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";
import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { personLabel } from "@/lib/person";

type Person = { id: string; name: string; nickname: string | null };

const initial: ActionState = {};

export function ObligationForm({
  people,
  defaultCurrency,
  copy,
}: {
  people: Person[];
  defaultCurrency: string;
  copy: Dictionary["obligation"];
}) {
  const [state, action, pending] = useActionState(createObligation, initial);
  const [personId, setPersonId] = useState(people[0]?.id ?? "__new__");
  const today = new Date().toISOString().slice(0, 10);
  const showNewPerson = personId === "__new__" || people.length === 0;
  const fieldClass =
    "rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2";

  return (
    <form action={action} className="mt-8 flex max-w-xl flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.person}
        <select
          name="personId"
          value={personId}
          onChange={(event) => setPersonId(event.target.value)}
          className={fieldClass}
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {personLabel(person)}
            </option>
          ))}
          <option value="__new__">{copy.someoneNew}</option>
        </select>
      </label>

      {showNewPerson ? (
        <>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            {copy.newPersonName}
            <input name="newPersonName" required className={fieldClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            {copy.newPersonNickname}
            <input name="newPersonNickname" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            {copy.newPersonPhone}
            <input name="newPersonPhone" inputMode="tel" className={fieldClass} />
          </label>
        </>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {copy.reason}
        <input
          name="title"
          required
          placeholder={copy.reasonPlaceholder}
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {copy.total}
          <input
            name="totalAmount"
            required
            inputMode="decimal"
            placeholder="120.00"
            className={`${fieldClass} font-mono`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {copy.currency}
          <select
            name="currency"
            defaultValue={defaultCurrency}
            className={fieldClass}
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {copy.installments}
          <input
            name="installmentCount"
            type="number"
            min={1}
            max={60}
            defaultValue={1}
            className={`${fieldClass} font-mono`}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {copy.firstDue}
          <input
            name="firstDueDate"
            type="date"
            required
            defaultValue={today}
            className={fieldClass}
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-stone-500">{copy.hint}</p>

      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950 disabled:opacity-60"
      >
        {pending ? copy.saving : copy.submit}
      </button>
    </form>
  );
}
