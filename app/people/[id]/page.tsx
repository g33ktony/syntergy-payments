import { AppHeader } from "@/components/app-header";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { InstallmentRow } from "@/components/installment-row";
import { PersonDetailsForm } from "@/components/person-details-form";
import { deleteObligation, deletePerson } from "@/lib/actions";
import { getDictionary } from "@/lib/get-dictionary";
import { localeTag } from "@/lib/i18n";
import { formatDueDate } from "@/lib/installments";
import { formatMoney } from "@/lib/money";
import { getPersonProfile, progressFor } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getDictionary();
  const tag = localeTag(locale);
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
            {t.nav.ledger}
          </Link>
          <span className="mx-2">/</span>
          {t.nav.people}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-stone-50">
              {profile.person.name}
            </h1>
            {profile.person.phone ? (
              <p className="mt-2 text-sm text-stone-400">{profile.person.phone}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-lg text-amber-100">
              {formatMoney(profile.openBalance, currency, tag)} {t.person.open}
            </p>
            <ConfirmDeleteButton
              label={t.person.deletePerson}
              pendingLabel={t.row.deleting}
              confirmMessage={t.person.deletePersonConfirm(profile.person.name)}
              onDelete={deletePerson.bind(null, profile.person.id)}
            />
          </div>
        </div>

        {profile.overdueCount > 0 ? (
          <p className="mt-4 text-sm text-red-300">
            {profile.overdueCount === 1
              ? t.person.overdueOne
              : t.person.overdueMany(profile.overdueCount)}
          </p>
        ) : null}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t.person.totalOwed}
            value={formatMoney(profile.registeredTotal, currency, tag)}
          />
          <Stat
            label={t.person.totalPaid}
            value={formatMoney(profile.paidTotal, currency, tag)}
          />
          <Stat
            label={t.wallet.cash}
            value={formatMoney(profile.cashPaid, currency, tag)}
          />
          <Stat
            label={t.wallet.transfer}
            value={formatMoney(profile.transferPaid, currency, tag)}
          />
        </section>
        <p className="mt-3 text-xs text-stone-500">
          {t.person.lastPayment}:{" "}
          {profile.lastPaidAt
            ? formatDueDate(profile.lastPaidAt, tag)
            : t.person.never}
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {t.person.details}
          </h2>
          <PersonDetailsForm
            personId={profile.person.id}
            name={profile.person.name}
            phone={profile.person.phone ?? ""}
            notes={profile.person.notes ?? ""}
            t={t}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {t.person.upcoming}
          </h2>
          {profile.upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.noneUpcoming}</p>
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
            {t.person.paid}
          </h2>
          {profile.paid.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.nonePaid}</p>
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
            {t.person.obligations}
          </h2>
          {profile.person.obligations.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.noneObligations}</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-800">
              {profile.person.obligations.map((obligation) => {
                const { paidCount, total } = progressFor(obligation.installments);
                return (
                  <li
                    key={obligation.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-stone-50">{obligation.title}</p>
                        <p className="font-mono text-sm text-stone-300">
                          {formatMoney(obligation.totalAmount, obligation.currency, tag)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        {t.person.paidOf(paidCount, total)} · {t.person.started}{" "}
                        {formatDueDate(
                          obligation.installments[0]?.dueDate ?? obligation.createdAt,
                          tag,
                        )}
                      </p>
                    </div>
                    <ConfirmDeleteButton
                      label={t.row.delete}
                      pendingLabel={t.row.deleting}
                      confirmMessage={t.row.deleteObligationConfirm(obligation.title)}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-stone-800 px-4 py-4">
      <p className="text-xs tracking-wide text-stone-500 uppercase">{label}</p>
      <p className="mt-2 font-mono text-lg text-stone-50">{value}</p>
    </article>
  );
}
