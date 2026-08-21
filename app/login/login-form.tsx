"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const initial: LoginState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-10 flex flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <label className="flex flex-col gap-2 text-sm text-stone-300">
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
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
        className="mt-2 rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
