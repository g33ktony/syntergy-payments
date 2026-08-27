import { AppHeader } from "@/components/app-header";
import { InstallmentGroup } from "@/components/installment-group";
import { getCurrentAccountId } from "@/lib/auth-server";
import { getDictionary } from "@/lib/get-dictionary";
import { groupBySequence, startOfUtcDay } from "@/lib/installments";
import { getUpcomingInstallments } from "@/lib/queries";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export default async function DashboardPage() {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  const upcoming = await getUpcomingInstallments(accountId);
  const today = startOfUtcDay();
  const overdue = upcoming.filter((item) => item.dueDate < today);
  const dueSoon = upcoming.filter((item) => item.dueDate >= today);
  const overdueGroups = groupBySequence(
    overdue,
    (item) => item.obligation.id,
    (item) => item.sequence,
  );
  const dueSoonGroups = groupBySequence(
    dueSoon,
    (item) => item.obligation.id,
    (item) => item.sequence,
  );

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

        {upcoming.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="mt-10 grid gap-10">
            {overdueGroups.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-red-300 uppercase">
                  {t.dashboard.overdue}
                </h2>
                <ul className="mt-2">
                  {overdueGroups.map(({ primary, rest }) => (
                    <InstallmentGroup key={primary.id} primary={primary} rest={rest} />
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
                {t.dashboard.upcoming}
              </h2>
              {dueSoonGroups.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">{t.dashboard.nothingDue}</p>
              ) : (
                <ul className="mt-2">
                  {dueSoonGroups.map(({ primary, rest }) => (
                    <InstallmentGroup key={primary.id} primary={primary} rest={rest} />
                  ))}
                </ul>
              )}
            </section>

            <p className="text-sm text-stone-500">
              {t.dashboard.historyHint}{" "}
              <Link href="/wallet" className="text-amber-100 hover:text-amber-50">
                {t.nav.wallet}
              </Link>
            </p>
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
