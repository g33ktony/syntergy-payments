import Link from "next/link";
import { logout } from "@/app/login/actions";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionary } from "@/lib/get-dictionary";

export async function AppHeader() {
  const { locale, t } = await getDictionary();

  return (
    <header className="border-b border-stone-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group">
          <p className="text-xs font-medium tracking-[0.18em] text-amber-200/80 uppercase">
            {t.brand}
          </p>
          <p className="font-serif text-xl text-stone-50 group-hover:text-amber-100">
            {t.product}
          </p>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/wallet"
            className="rounded-lg px-3 py-2 text-sm text-stone-300 hover:text-stone-100"
          >
            {t.nav.wallet}
          </Link>
          <Link
            href="/obligations/new"
            className="rounded-lg bg-amber-200 px-3.5 py-2 text-sm font-medium text-stone-950"
          >
            {t.nav.register}
          </Link>
          <LanguageToggle locale={locale} />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-stone-500"
            >
              {t.nav.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
