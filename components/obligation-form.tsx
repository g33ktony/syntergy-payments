"use client";

import { useActionState, useState } from "react";
import { createObligation, type ActionState } from "@/lib/actions";

type Person = { id: string; name: string };

const initial: ActionState = {};

export function ObligationForm({
  people,
  defaultCurrency,
}: {
  people: Person[];
  defaultCurrency: string;
}) {
  const [state, action, pending] = useActionState(createObligation, initial);
  const [personId, setPersonId] = useState(people[0]?.id ?? "__new__");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="mt-8 flex max-w-xl flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        Person
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
          <option value="__new__">Someone new…</option>
        </select>
      </label>

      {personId === "__new__" || people.length === 0 ? (
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          New person name
          <input
            name="newPersonName"
            required={personId === "__new__" || people.length === 0}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-stone-300">
        Reason or product
        <input
          name="title"
          required
          placeholder="Refrigerator, taxi, laptop…"
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          Total amount
          <input
            name="totalAmount"
            required
            inputMode="decimal"
            placeholder="120.00"
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 font-mono text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-300">
          Currency
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
          Installments
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
          First due date
          <input
            name="firstDueDate"
            type="date"
            required
            defaultValue={today}
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-stone-500">
        Multiple installments are split evenly and scheduled monthly from the
        first due date. Remainder cents go on the last payment.
      </p>

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
        {pending ? "Saving…" : "Register obligation"}
      </button>
    </form>
  );
}
