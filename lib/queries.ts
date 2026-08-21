import { prisma } from "@/lib/db";
import { startOfUtcDay } from "@/lib/installments";

const installmentInclude = {
  obligation: {
    include: {
      person: true,
      installments: { orderBy: { sequence: "asc" as const } },
    },
  },
};

export type InstallmentWithObligation = Awaited<
  ReturnType<typeof getUpcomingInstallments>
>[number];

export async function getUpcomingInstallments() {
  return prisma.installment.findMany({
    where: { paidAt: null },
    orderBy: { dueDate: "asc" },
    include: installmentInclude,
  });
}

export async function getRecentPaidInstallments() {
  return prisma.installment.findMany({
    where: { paidAt: { not: null } },
    orderBy: { paidAt: "desc" },
    take: 12,
    include: installmentInclude,
  });
}

export async function getPeople() {
  return prisma.person.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getPersonProfile(id: string) {
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      obligations: {
        orderBy: { createdAt: "desc" },
        include: {
          installments: { orderBy: { sequence: "asc" } },
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

  return {
    person,
    openBalance,
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
