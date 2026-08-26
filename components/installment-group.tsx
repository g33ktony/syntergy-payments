import { InstallmentRowBody, type RowProps } from "@/components/installment-row";
import { getDictionary } from "@/lib/get-dictionary";

export async function InstallmentGroup({
  primary,
  rest,
  showPaidAt,
}: {
  primary: RowProps["installment"];
  rest: RowProps["installment"][];
  showPaidAt?: boolean;
}) {
  const { t } = await getDictionary();

  return (
    <li className="border-b border-stone-800 py-4 last:border-b-0">
      <InstallmentRowBody installment={primary} showPaidAt={showPaidAt} />
      {rest.length > 0 ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs tracking-wide text-stone-500 uppercase">
            {t.row.moreInstallments(rest.length)}
          </summary>
          <ul className="mt-2 divide-y divide-stone-800/60 border-t border-stone-800/60">
            {rest.map((installment) => (
              <li key={installment.id} className="py-3">
                <InstallmentRowBody installment={installment} showPaidAt={showPaidAt} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </li>
  );
}
