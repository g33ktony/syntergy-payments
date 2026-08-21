"use client";

import { setLocale } from "@/lib/locale-actions";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle({ locale }: { locale: Locale }) {
  return (
    <div className="flex rounded-lg border border-stone-700 text-xs">
      <form action={setLocale.bind(null, "es")}>
        <button
          type="submit"
          className={`px-2.5 py-2 ${locale === "es" ? "bg-stone-800 text-amber-100" : "text-stone-400 hover:text-stone-200"}`}
        >
          ES
        </button>
      </form>
      <form action={setLocale.bind(null, "en")}>
        <button
          type="submit"
          className={`px-2.5 py-2 ${locale === "en" ? "bg-stone-800 text-amber-100" : "text-stone-400 hover:text-stone-200"}`}
        >
          EN
        </button>
      </form>
    </div>
  );
}
