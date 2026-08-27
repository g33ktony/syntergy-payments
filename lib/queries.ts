import { prisma } from "@/lib/db";
import { startOfUtcDay } from "@/lib/installments";

const installmentInclude = {
  obligation: {
    include: {
      person: true,
      installments: { orderBy: { sequence: "asc" as const } },
    },
  },
  reasons: { orderBy: { createdAt: "asc" as const } },
};

export type InstallmentWithObligation = Awaited<
  ReturnType<typeof getUpcomingInstallments>
>[number];

export async function getUpcomingInstallments(accountId: string) {
  return prisma.installment.findMany({
    where: { paidAt: null, obligation: { person: { accountId } } },
    orderBy: { dueDate: "asc" },
    include: installmentInclude,
  });
}

export async function getPeople(accountId: string) {
  return prisma.person.findMany({
    where: { accountId },
    orderBy: { name: "asc" },
  });
}

export async function getPersonProfile(id: string, accountId: string) {
  const person = await prisma.person.findFirst({
    where: { id, accountId },
    include: {
      obligations: {
        orderBy: { createdAt: "desc" },
        include: {
          installments: {
            orderBy: { sequence: "asc" },
            include: { reasons: { orderBy: { createdAt: "asc" } } },
          },
        },
      },
    },
  });

  if (!person) {
    return null;
  }

  const installments = person.obligations.flatMap((obligation) =>
    obligation.installments.map((installment) => ({ installment, obligation })),
  );
  const unpaid = installments.filter(({ installment }) => !installment.paidAt);
  const paid = installments
    .filter(({ installment }) => installment.paidAt)
    .sort(
      (a, b) =>
        (b.installment.paidAt?.getTime() ?? 0) -
        (a.installment.paidAt?.getTime() ?? 0),
    );
  const openBalance = unpaid.reduce(
    (sum, { installment }) => sum + installment.amount,
    0,
  );
  const today = startOfUtcDay();
  const paidTotal = paid.reduce((sum, { installment }) => sum + installment.amount, 0);
  const registeredTotal = person.obligations.reduce(
    (sum, obligation) => sum + obligation.totalAmount,
    0,
  );
  const cashPaid = paid
    .filter(({ installment }) => installment.paymentMethod === "CASH")
    .reduce((sum, { installment }) => sum + installment.amount, 0);
  const transferPaid = paid
    .filter(({ installment }) => installment.paymentMethod === "TRANSFER")
    .reduce((sum, { installment }) => sum + installment.amount, 0);

  return {
    person,
    openBalance,
    paidTotal,
    registeredTotal,
    cashPaid,
    transferPaid,
    lastPaidAt: paid[0]?.installment.paidAt ?? null,
    upcoming: unpaid
      .slice()
      .sort(
        (a, b) =>
          a.installment.dueDate.getTime() - b.installment.dueDate.getTime(),
      ),
    paid,
    overdueCount: unpaid.filter(
      ({ installment }) => installment.dueDate < today,
    ).length,
  };
}

export function progressFor(installments: { paidAt: Date | null }[]) {
  const paidCount = installments.filter((item) => item.paidAt).length;
  return { paidCount, total: installments.length };
}

export async function getWallet(accountId: string) {
  const paid = await prisma.installment.findMany({
    where: { paidAt: { not: null }, obligation: { person: { accountId } } },
    orderBy: { paidAt: "desc" },
    include: installmentInclude,
  });

  const byCurrency = new Map<
    string,
    { total: number; cash: number; transfer: number; unrecorded: number }
  >();

  for (const item of paid) {
    const currency = item.obligation.currency;
    const bucket = byCurrency.get(currency) ?? {
      total: 0,
      cash: 0,
      transfer: 0,
      unrecorded: 0,
    };
    bucket.total += item.amount;
    if (item.paymentMethod === "CASH") {
      bucket.cash += item.amount;
    } else if (item.paymentMethod === "TRANSFER") {
      bucket.transfer += item.amount;
    } else {
      bucket.unrecorded += item.amount;
    }
    byCurrency.set(currency, bucket);
  }

  return { paid, totals: [...byCurrency.entries()] };
}
