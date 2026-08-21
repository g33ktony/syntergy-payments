import { AppHeader } from "@/components/app-header";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { InstallmentRow } from "@/components/installment-row";
import { deleteObligation, deletePerson } from "@/lib/actions";
import { formatMoney } from "@/lib/money";
import { getPersonProfile, progressFor } from "@/lib/queries";
import { formatDueDate } from "@/lib/installments";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPersonProfile(id);
  if (!profile) {
    notFound();
  }

  const currency =
    profile.person.obligations[0]?.currency ?? process.env.DEFAULT_CURRENCY ?? "USD";

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <p className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-300">
            Ledger
          </Link>
          <span className="mx-2">/</span>
          People
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-stone-50">
              {profile.person.name}
            </h1>
            {profile.person.notes ? (
              <p className="mt-2 text-sm text-stone-400">{profile.person.notes}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-lg text-amber-100">
              {formatMoney(profile.openBalance, currency)} open
            </p>
            <ConfirmDeleteButton
              label="Delete person"
              confirmMessage={`Delete ${profile.person.name} and every obligation attached to them?`}
              onDelete={deletePerson.bind(null, profile.person.id)}
            />
          </div>
        </div>

        {profile.overdueCount > 0 ? (
          <p className="mt-4 text-sm text-red-300">
            {profile.overdueCount} overdue installment
            {profile.overdueCount === 1 ? "" : "s"}
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            Upcoming
          </h2>
          {profile.upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">Nothing outstanding.</p>
          ) : (
            <ul className="mt-2">
              {profile.upcoming.map(({ installment, obligation }) => (
                <InstallmentRow
                  key={installment.id}
                  installment={{
                    ...installment,
                    obligation: {
                      id: obligation.id,
                      title: obligation.title,
                      currency: obligation.currency,
                      person: profile.person,
                      installments: obligation.installments,
                    },
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            Paid
          </h2>
          {profile.paid.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No payments yet.</p>
          ) : (
            <ul className="mt-2">
              {profile.paid.map(({ installment, obligation }) => (
                <InstallmentRow
                  key={installment.id}
                  installment={{
                    ...installment,
                    obligation: {
                      id: obligation.id,
                      title: obligation.title,
                      currency: obligation.currency,
                      person: profile.person,
                      installments: obligation.installments,
                    },
                  }}
                  showPaidAt
                />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            Obligations
          </h2>
          {profile.person.obligations.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">None yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-800">
              {profile.person.obligations.map((obligation) => {
                const { paidCount, total } = progressFor(obligation.installments);
                return (
                  <li key={obligation.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-stone-50">{obligation.title}</p>
                        <p className="font-mono text-sm text-stone-300">
                          {formatMoney(obligation.totalAmount, obligation.currency)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        {paidCount}/{total} paid · started{" "}
                        {formatDueDate(obligation.installments[0]?.dueDate ?? obligation.createdAt)}
                      </p>
                    </div>
                    <ConfirmDeleteButton
                      label="Delete"
                      confirmMessage={`Delete “${obligation.title}” and all of its installments?`}
                      onDelete={deleteObligation.bind(null, obligation.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
