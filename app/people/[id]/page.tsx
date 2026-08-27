import { AppHeader } from "@/components/app-header";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { InstallmentGroup } from "@/components/installment-group";
import { InstallmentRow, type RowProps } from "@/components/installment-row";
import { PersonDetailsForm } from "@/components/person-details-form";
import { deleteObligation, deletePerson } from "@/lib/actions";
import { getCurrentAccountId } from "@/lib/auth-server";
import { getDictionary } from "@/lib/get-dictionary";
import type { Dictionary } from "@/lib/i18n";
import { localeTag } from "@/lib/i18n";
import { formatDueDate, groupBySequence } from "@/lib/installments";
import { formatMoney } from "@/lib/money";
import { getPersonProfile, progressFor } from "@/lib/queries";
import { whatsappHref } from "@/lib/phone";
import Link from "next/link";
import { notFound } from "next/navigation";

type PersonProfile = NonNullable<Awaited<ReturnType<typeof getPersonProfile>>>;
type ObligationSummary = PersonProfile["person"]["obligations"][number];
type UpcomingEntry = PersonProfile["upcoming"][number];

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountId = await getCurrentAccountId();
  const { locale, t } = await getDictionary();
  const tag = localeTag(locale);
  const profile = await getPersonProfile(id, accountId);
  if (!profile) {
    notFound();
  }

  const currency =
    profile.person.obligations[0]?.currency ?? process.env.DEFAULT_CURRENCY ?? "USD";
  const whatsapp = whatsappHref(profile.person.phone ?? "");
  const pendingObligations = profile.person.obligations.filter(
    (obligation) => progressFor(obligation.installments).paidCount === 0,
  );
  const settledObligations = profile.person.obligations.filter(
    (obligation) => progressFor(obligation.installments).paidCount > 0,
  );
  const upcomingGroups = groupBySequence(
    profile.upcoming,
    (entry) => entry.obligation.id,
    (entry) => entry.installment.sequence,
  );
  const toRowInstallment = (entry: UpcomingEntry): RowProps["installment"] => ({
    ...entry.installment,
    obligation: {
      id: entry.obligation.id,
      title: entry.obligation.title,
      currency: entry.obligation.currency,
      person: profile.person,
      installments: entry.obligation.installments,
    },
  });

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
            {profile.person.nickname ? (
              <p className="mt-1 text-sm text-amber-100/80">
                {profile.person.nickname}
              </p>
            ) : null}
            {profile.person.howKnown ? (
              <p className="mt-2 text-sm text-stone-400">{profile.person.howKnown}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-400">
              {profile.person.phone ? (
                <span>{profile.person.phone}</span>
              ) : null}
              {whatsapp ? (
                <Link
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-100 hover:text-amber-50"
                >
                  {t.person.whatsapp}
                </Link>
              ) : null}
            </div>
            {profile.person.preferredPaymentMethod || profile.person.bankClabe ? (
              <p className="mt-2 text-sm text-stone-500">
                {profile.person.preferredPaymentMethod
                  ? t.method[profile.person.preferredPaymentMethod]
                  : null}
                {profile.person.preferredPaymentMethod && profile.person.bankClabe
                  ? " · "
                  : null}
                {profile.person.bankClabe ? (
                  <span className="font-mono text-stone-300">
                    {profile.person.bankClabe}
                  </span>
                ) : null}
              </p>
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
            nickname={profile.person.nickname ?? ""}
            phone={profile.person.phone ?? ""}
            howKnown={profile.person.howKnown ?? ""}
            preferredPaymentMethod={profile.person.preferredPaymentMethod}
            bankClabe={profile.person.bankClabe ?? ""}
            notes={profile.person.notes ?? ""}
            copy={{
              name: t.person.name,
              nickname: t.person.nickname,
              nicknamePlaceholder: t.person.nicknamePlaceholder,
              phone: t.person.phone,
              phonePlaceholder: t.person.phonePlaceholder,
              howKnown: t.person.howKnown,
              howKnownPlaceholder: t.person.howKnownPlaceholder,
              preferredMethod: t.person.preferredMethod,
              methodUnset: t.person.methodUnset,
              bankClabe: t.person.bankClabe,
              bankClabePlaceholder: t.person.bankClabePlaceholder,
              notes: t.person.notes,
              notesPlaceholder: t.person.notesPlaceholder,
              save: t.person.save,
              saving: t.person.saving,
              cash: t.method.CASH,
              transfer: t.method.TRANSFER,
            }}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {t.person.upcoming}
          </h2>
          {upcomingGroups.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.noneUpcoming}</p>
          ) : (
            <ul className="mt-2">
              {upcomingGroups.map(({ primary, rest }) => (
                <InstallmentGroup
                  key={primary.installment.id}
                  primary={toRowInstallment(primary)}
                  rest={rest.map(toRowInstallment)}
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
            {t.person.obligationsPending}
          </h2>
          {pendingObligations.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.noneObligationsPending}</p>
          ) : (
            <ObligationList
              obligations={pendingObligations}
              locale={tag}
              t={t}
            />
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {t.person.obligationsPaid}
          </h2>
          {settledObligations.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.person.noneObligationsPaid}</p>
          ) : (
            <ObligationList
              obligations={settledObligations}
              locale={tag}
              t={t}
            />
          )}
        </section>
      </main>
    </>
  );
}

function ObligationList({
  obligations,
  locale,
  t,
}: {
  obligations: ObligationSummary[];
  locale: string;
  t: Dictionary;
}) {
  return (
    <ul className="mt-3 divide-y divide-stone-800">
      {obligations.map((obligation) => {
        const { paidCount, total } = progressFor(obligation.installments);
        const isPartial = paidCount > 0 && paidCount < total;
        return (
          <li
            key={obligation.id}
            className="flex flex-wrap items-start justify-between gap-3 py-4"
          >
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-stone-50">{obligation.title}</p>
                {isPartial ? (
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200">
                    {t.person.partialTag}
                  </span>
                ) : null}
                <p className="ml-auto font-mono text-sm text-stone-300">
                  {formatMoney(obligation.totalAmount, obligation.currency, locale)}
                </p>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {t.person.paidOf(paidCount, total)} · {t.person.started}{" "}
                {formatDueDate(
                  obligation.installments[0]?.dueDate ?? obligation.createdAt,
                  locale,
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
