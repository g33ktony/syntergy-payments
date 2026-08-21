import { AppHeader } from "@/components/app-header";
import { ObligationForm } from "@/components/obligation-form";
import { defaultCurrency } from "@/lib/money";
import { getPeople } from "@/lib/queries";
import Link from "next/link";

export default async function NewObligationPage() {
  const people = await getPeople();
  const currency = defaultCurrency();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <p className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-300">
            Ledger
          </Link>
          <span className="mx-2">/</span>
          New
        </p>
        <h1 className="mt-3 font-serif text-4xl text-stone-50">
          Register an obligation
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">
          Add the person, the reason or product, the total, and how many
          installments. A single installment is a lump sum.
        </p>
        <ObligationForm people={people} defaultCurrency={currency} />
      </main>
    </>
  );
}
