import { AppHeader } from "@/components/app-header";
import { InstallmentRow } from "@/components/installment-row";
import { getDictionary } from "@/lib/get-dictionary";
import { startOfUtcDay } from "@/lib/installments";
import { getRecentPaidInstallments, getUpcomingInstallments } from "@/lib/queries";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export default async function DashboardPage() {
  const { t } = await getDictionary();
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
            <h1 className="font-serif text-4xl text-stone-50">{t.dashboard.title}</h1>
            <p className="mt-2 text-sm text-stone-400">{t.dashboard.subtitle}</p>
          </div>
          <Link
            href="/obligations/new"
            className="mt-4 inline-flex w-fit rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950 sm:mt-0"
          >
            {t.dashboard.register}
          </Link>
        </div>

        {upcoming.length === 0 && recent.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="mt-10 grid gap-10">
            {overdue.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-red-300 uppercase">
                  {t.dashboard.overdue}
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
                {t.dashboard.upcoming}
              </h2>
              {dueSoon.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">{t.dashboard.nothingDue}</p>
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
                {t.dashboard.recent}
              </h2>
              {recent.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">{t.dashboard.noPaid}</p>
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

function EmptyState({ t }: { t: Dictionary }) {
  return (
    <div className="mt-14 rounded-2xl border border-dashed border-stone-700 px-6 py-14 text-center">
      <p className="font-serif text-2xl text-stone-100">{t.dashboard.emptyTitle}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-400">
        {t.dashboard.emptyBody}
      </p>
      <Link
        href="/obligations/new"
        className="mt-6 inline-flex rounded-lg bg-amber-200 px-4 py-2.5 text-sm font-medium text-stone-950"
      >
        {t.dashboard.register}
      </Link>
    </div>
  );
}
