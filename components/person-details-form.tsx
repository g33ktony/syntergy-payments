"use client";

import { useActionState } from "react";
import { updatePerson, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/lib/i18n";

const initial: ActionState = {};

export function PersonDetailsForm({
  personId,
  name,
  phone,
  notes,
  t,
}: {
  personId: string;
  name: string;
  phone: string;
  notes: string;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState(updatePerson, initial);

  return (
    <form action={action} className="mt-6 grid max-w-xl gap-4">
      <input type="hidden" name="personId" value={personId} />
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {t.person.name}
        <input
          name="name"
          required
          defaultValue={name}
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {t.person.phone}
        <input
          name="phone"
          defaultValue={phone}
          inputMode="tel"
          placeholder={t.person.phonePlaceholder}
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {t.person.notes}
        <textarea
          name="notes"
          defaultValue={notes}
          rows={3}
          placeholder={t.person.notesPlaceholder}
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
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
        {pending ? t.person.saving : t.person.save}
      </button>
    </form>
  );
}
