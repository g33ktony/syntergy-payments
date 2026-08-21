import Link from "next/link";
import { logout } from "@/app/login/actions";

export function AppHeader() {
  return (
    <header className="border-b border-stone-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group">
          <p className="text-xs font-medium tracking-[0.18em] text-amber-200/80 uppercase">
            Syntergy
          </p>
          <p className="font-serif text-xl text-stone-50 group-hover:text-amber-100">
            Payments
          </p>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/obligations/new"
            className="rounded-lg bg-amber-200 px-3.5 py-2 text-sm font-medium text-stone-950"
          >
            Register
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:border-stone-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
