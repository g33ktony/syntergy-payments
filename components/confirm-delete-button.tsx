"use client";

import { useTransition } from "react";

export function ConfirmDeleteButton({
  label,
  confirmMessage,
  onDelete,
}: {
  label: string;
  confirmMessage: string;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) {
          return;
        }
        startTransition(() => {
          void onDelete();
        });
      }}
      className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-400 hover:border-red-400/50 hover:text-red-300 disabled:opacity-60"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}
