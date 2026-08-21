import { AppHeader } from "@/components/app-header";
import { InstallmentRow } from "@/components/installment-row";
import { startOfUtcDay } from "@/lib/installments";
import { getRecentPaidInstallments, getUpcomingInstallments } from "@/lib/queries";
import Link from "next/link";

export default async function DashboardPage() {
  const [upcoming, recent] = await Promise.all([
    getUpcomingInstallments(),
    getRecentPaidInstallments(),
  ]);
  const today = startOfUtcDay();
  const overdue = upcoming.filter((item) => item.dueDate < today);
  const dueSoon = upcoming.filter((item) => item.dueDate >= today);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-stone-50">Ledger</h1>
            <p className="mt-2 text-sm text-stone-400">
              Who still owes you, what for, and which installment is next.
            </p>
          </div>
          <Link
            href="/obligations/new"
            className="mt-4 inline-flex w-fit rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950 sm:mt-0"
          >
            Register a payment
          </Link>
        </div>

        {upcoming.length === 0 && recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-10 grid gap-10">
            {overdue.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-red-300 uppercase">
                  Overdue
                </h2>
                <ul className="mt-2">
                  {overdue.map((installment) => (
                    <InstallmentRow key={installment.id} installment={installment} />
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
                Upcoming
              </h2>
              {dueSoon.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">Nothing due next.</p>
              ) : (
                <ul className="mt-2">
                  {dueSoon.map((installment) => (
                    <InstallmentRow key={installment.id} installment={installment} />
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
                Recently paid
              </h2>
              {recent.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">No payments recorded yet.</p>
              ) : (
                <ul className="mt-2">
                  {recent.map((installment) => (
                    <InstallmentRow
                      key={installment.id}
                      installment={installment}
                      showPaidAt
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-14 rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
      <p className="font-serif text-2xl text-stone-100">No debts on the books</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-400">
        Register the first obligation: who owes you, what it was for, and whether
        they will pay in installments.
      </p>
      <Link
        href="/obligations/new"
        className="mt-6 inline-flex rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950"
      >
        Register a payment
      </Link>
    </div>
  );
}
