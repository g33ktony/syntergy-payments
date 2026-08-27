"use client";

import { useActionState } from "react";
import { signup } from "@/app/login/actions";
import type { LoginState } from "@/app/login/actions";

const initial: LoginState = {};

export function SignupForm({
  emailLabel,
  passwordLabel,
  passwordHint,
  submitLabel,
  submittingLabel,
}: {
  emailLabel: string;
  passwordLabel: string;
  passwordHint: string;
  submitLabel: string;
  submittingLabel: string;
}) {
  const [state, action, pending] = useActionState(signup, initial);

  return (
    <form action={action} className="mt-10 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {emailLabel}
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        {passwordLabel}
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-stone-50 outline-none ring-amber-400/40 focus:ring-2"
        />
        <span className="text-xs text-stone-500">{passwordHint}</span>
      </label>
      {state.error ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950 disabled:opacity-60"
      >
        {pending ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
