"use client";

import { useActionState, useState } from "react";
import { createObligation, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";

type Person = { id: string; name: string };

const initial: ActionState = {};

export function ObligationForm({
  people,
  defaultCurrency,
  t,
}: {
  people: Person[];
  defaultCurrency: string;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState(createObligation, initial);
  const [personId, setPersonId] = useState(people[0]?.id ?? "__new__");
  const today = new Date().toISOString().slice(0, 10);
  const showNewPerson = personId === "__new__" || people.length === 0;

  return (
    <form action={action} className="mt-8 flex max-w-xl flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {t.obligation.person}
        <select
          name="personId"
          value={personId}
          onChange={(event) => setPersonId(event.target.value)}
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
          <option value="__new__">{t.obligation.someoneNew}</option>
        </select>
      </label>

      {showNewPerson ? (
        <>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            {t.obligation.newPersonName}
            <input
              name="newPersonName"
              required
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-300">
            {t.obligation.newPersonPhone}
            <input
              name="newPersonPhone"
              inputMode="tel"
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
            />
          </label>
        </>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {t.obligation.reason}
        <input
          name="title"
          required
          placeholder={t.obligation.reasonPlaceholder}
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {t.obligation.total}
          <input
            name="totalAmount"
            required
            inputMode="decimal"
            placeholder="120.00"
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 font-mono text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {t.obligation.currency}
          <input
            name="currency"
            defaultValue={defaultCurrency}
            maxLength={3}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 uppercase text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {t.obligation.installments}
          <input
            name="installmentCount"
            type="number"
            min={1}
            max={60}
            defaultValue={1}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 font-mono text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          {t.obligation.firstDue}
          <input
            name="firstDueDate"
            type="date"
            required
            defaultValue={today}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-stone-500">{t.obligation.hint}</p>

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
        {pending ? t.obligation.saving : t.obligation.submit}
      </button>
    </form>
  );
}
