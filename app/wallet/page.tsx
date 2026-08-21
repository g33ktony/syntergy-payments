import { AppHeader } from "@/components/app-header";
import { getDictionary } from "@/lib/get-dictionary";
import { localeTag } from "@/lib/i18n";
import { formatDueDate } from "@/lib/installments";
import { formatMoney } from "@/lib/money";
import { personLabel } from "@/lib/person";
import { getWallet } from "@/lib/queries";
import Link from "next/link";

export default async function WalletPage() {
  const { locale, t } = await getDictionary();
  const tag = localeTag(locale);
  const { paid, totals } = await getWallet();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="font-serif text-4xl text-stone-50">{t.wallet.title}</h1>
        <p className="mt-2 text-sm text-stone-400">{t.wallet.subtitle}</p>

        {totals.length === 0 ? (
          <p className="mt-10 text-sm text-stone-500">{t.wallet.empty}</p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {totals.map(([currency, bucket]) => (
              <div key={currency} className="contents">
                <article className="rounded-2xl border border-stone-800 px-4 py-5">
                  <p className="text-xs tracking-wide text-stone-500 uppercase">
                    {t.wallet.grandTotal}
                  </p>
                  <p className="mt-2 font-mono text-2xl text-amber-100">
                    {formatMoney(bucket.total, currency, tag)}
                  </p>
                </article>
                <article className="rounded-2xl border border-stone-800 px-4 py-5">
                  <p className="text-xs tracking-wide text-stone-500 uppercase">
                    {t.wallet.cash}
                  </p>
                  <p className="mt-2 font-mono text-2xl text-stone-50">
                    {formatMoney(bucket.cash, currency, tag)}
                  </p>
                </article>
                <article className="rounded-2xl border border-stone-800 px-4 py-5">
                  <p className="text-xs tracking-wide text-stone-500 uppercase">
                    {t.wallet.transfer}
                  </p>
                  <p className="mt-2 font-mono text-2xl text-stone-50">
                    {formatMoney(bucket.transfer, currency, tag)}
                  </p>
                </article>
                {bucket.unrecorded > 0 ? (
                  <article className="rounded-2xl border border-stone-800 px-4 py-5 sm:col-span-3">
                    <p className="text-xs tracking-wide text-stone-500 uppercase">
                      {t.wallet.unrecorded}
                    </p>
                    <p className="mt-2 font-mono text-xl text-stone-300">
                      {formatMoney(bucket.unrecorded, currency, tag)}
                    </p>
                  </article>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-sm font-medium tracking-wide text-stone-400 uppercase">
            {t.wallet.history}
          </h2>
          {paid.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t.wallet.empty}</p>
          ) : (
            <ul className="mt-2">
              {paid.map((item) => {
                const method =
                  item.paymentMethod === "CASH"
                    ? t.method.CASH
                    : item.paymentMethod === "TRANSFER"
                      ? t.method.TRANSFER
                      : t.method.unknown;
                return (
                  <li
                    key={item.id}
                    className="grid gap-1 border-b border-stone-800 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <Link
                        href={`/people/${item.obligation.person.id}`}
                        className="font-medium text-stone-50 hover:text-amber-100"
                      >
                        {personLabel(item.obligation.person)}
                      </Link>
                      <p className="mt-1 text-sm text-stone-400">
                        {item.obligation.title}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {item.paidAt
                          ? formatDueDate(item.paidAt, tag)
                          : "—"}{" "}
                        · {method}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-amber-100">
                      {formatMoney(item.amount, item.obligation.currency, tag)}
                    </p>
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
