"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAccountId } from "@/lib/auth-server";
import { getDictionary } from "@/lib/get-dictionary";
import { prisma } from "@/lib/db";
import {
  monthlyDueDates,
  splitInstallmentAmounts,
} from "@/lib/installments";
import { defaultCurrency, parseAmountToCents } from "@/lib/money";
import { isPaymentMethod, type PaymentMethod } from "@/lib/payment-method";
import {
  buildBuckets,
  distributeAbono,
  remainingAmount,
  totalPaid,
  UNASSIGNED_BUCKET_ID,
} from "@/lib/reasons";
import type { Prisma } from "@prisma/client";

export type ActionState = {
  error?: string;
};

function refreshPaths(personId?: string) {
  revalidatePath("/");
  revalidatePath("/wallet");
  revalidatePath("/obligations/new");
  if (personId) {
    revalidatePath(`/people/${personId}`);
  }
}

export async function createObligation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  const title = String(formData.get("title") || "").trim();
  const personId = String(formData.get("personId") || "");
  const newPersonName = String(formData.get("newPersonName") || "").trim();
  const newPersonNickname = String(formData.get("newPersonNickname") || "").trim();
  const newPersonPhone = String(formData.get("newPersonPhone") || "").trim();
  const currency = (
    String(formData.get("currency") || defaultCurrency())
  )
    .trim()
    .toUpperCase();
  const installmentCount = Number(formData.get("installmentCount") || 1);
  const firstDueRaw = String(formData.get("firstDueDate") || "");
  const totalCents = parseAmountToCents(String(formData.get("totalAmount") || ""));

  if (!title) {
    return { error: t.errors.reasonRequired };
  }
  if (!totalCents || totalCents <= 0) {
    return { error: t.errors.amountInvalid };
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    return { error: t.errors.installmentsMin };
  }
  if (installmentCount > 60) {
    return { error: t.errors.installmentsMax };
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { error: t.errors.currencyInvalid };
  }
  if (!firstDueRaw) {
    return { error: t.errors.dueRequired };
  }

  const firstDue = new Date(`${firstDueRaw}T00:00:00.000Z`);
  if (Number.isNaN(firstDue.getTime())) {
    return { error: t.errors.dueInvalid };
  }

  let resolvedPersonId = personId;
  if (personId === "__new__" || !personId) {
    if (!newPersonName) {
      return { error: t.errors.personRequired };
    }
    const person = await prisma.person.create({
      data: {
        accountId,
        name: newPersonName,
        nickname: newPersonNickname || null,
        phone: newPersonPhone || null,
      },
    });
    resolvedPersonId = person.id;
  } else {
    const existing = await prisma.person.findFirst({
      where: { id: personId, accountId },
    });
    if (!existing) {
      return { error: t.errors.personMissing };
    }
  }

  const amounts = splitInstallmentAmounts(totalCents, installmentCount);
  const dates = monthlyDueDates(firstDue, installmentCount);

  const obligation = await prisma.obligation.create({
    data: {
      personId: resolvedPersonId,
      title,
      totalAmount: totalCents,
      currency,
      installmentCount,
      installments: {
        create: amounts.map((amount, index) => ({
          sequence: index + 1,
          amount,
          dueDate: dates[index],
        })),
      },
    },
  });

  refreshPaths(resolvedPersonId);
  redirect(`/people/${resolvedPersonId}?created=${obligation.id}`);
}

export async function updatePerson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  const personId = String(formData.get("personId") || "");
  const name = String(formData.get("name") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const howKnown = String(formData.get("howKnown") || "").trim();
  const preferredRaw = String(formData.get("preferredPaymentMethod") || "").trim();
  const bankClabe = String(formData.get("bankClabe") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    return { error: t.errors.nameRequired };
  }
  if (preferredRaw && !isPaymentMethod(preferredRaw)) {
    return { error: t.errors.paymentMethodRequired };
  }

  const { count } = await prisma.person.updateMany({
    where: { id: personId, accountId },
    data: {
      name,
      nickname: nickname || null,
      phone: phone || null,
      howKnown: howKnown || null,
      preferredPaymentMethod: isPaymentMethod(preferredRaw) ? preferredRaw : null,
      bankClabe: bankClabe || null,
      notes: notes || null,
    },
  });
  if (count === 0) {
    return { error: t.errors.personMissing };
  }
  refreshPaths(personId);
  return {};
}

export async function markInstallmentPaid(
  installmentId: string,
  method: PaymentMethod,
) {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  if (!isPaymentMethod(method)) {
    throw new Error(t.errors.paymentMethodRequired);
  }

  const installment = await prisma.installment.findFirst({
    where: { id: installmentId, obligation: { person: { accountId } } },
    include: { reasons: true, obligation: true },
  });
  if (!installment) {
    throw new Error(t.errors.installmentMissing);
  }

  const unassigned = remainingAmount(installment.amount, installment.reasons);

  await prisma.$transaction([
    prisma.installment.update({
      where: { id: installmentId },
      data: {
        paidAt: new Date(),
        paymentMethod: method,
        unassignedPaidAmount: unassigned,
      },
    }),
    ...installment.reasons.map((reason) =>
      prisma.installmentReason.update({
        where: { id: reason.id },
        data: { paidAmount: reason.amount },
      }),
    ),
  ]);

  refreshPaths(installment.obligation.personId);
}

// Marks the installment as fully paid once every bucket (named reasons plus
// whatever is unassigned) has been covered. Once paidAt is set it is never
// cleared here: motivo edits after that point are informational only.
async function syncInstallmentPaidState(
  tx: Prisma.TransactionClient,
  installmentId: string,
  method: PaymentMethod | null,
) {
  const installment = await tx.installment.findUniqueOrThrow({
    where: { id: installmentId },
    include: { reasons: true },
  });
  if (installment.paidAt) {
    return;
  }

  const paidSoFar =
    installment.reasons.reduce((sum, reason) => sum + reason.paidAmount, 0) +
    installment.unassignedPaidAmount;

  if (paidSoFar >= installment.amount) {
    await tx.installment.update({
      where: { id: installmentId },
      data: { paidAt: new Date(), paymentMethod: method },
    });
  }
}

export async function addInstallmentReason(
  installmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  const label = String(formData.get("label") || "").trim();
  const amountCents = parseAmountToCents(String(formData.get("amount") || ""));

  if (!label) {
    return { error: t.errors.reasonLabelRequired };
  }
  if (!amountCents || amountCents <= 0) {
    return { error: t.errors.amountInvalid };
  }

  const installment = await prisma.installment.findFirst({
    where: { id: installmentId, obligation: { person: { accountId } } },
    include: { reasons: true, obligation: true },
  });
  if (!installment) {
    return { error: t.errors.installmentMissing };
  }

  const remaining = remainingAmount(installment.amount, installment.reasons);
  if (remaining <= 0) {
    return { error: t.errors.reasonsFull };
  }
  if (amountCents > remaining) {
    return { error: t.errors.reasonExceedsRemaining };
  }

  // Carving a new reason out of the unassigned bucket can leave that bucket
  // smaller than what was already marked paid on it; move the overflow onto
  // the new reason so no bucket ever shows more paid than it's worth.
  const newUnassignedAmount = remaining - amountCents;
  const overflow = Math.max(installment.unassignedPaidAmount - newUnassignedAmount, 0);

  await prisma.$transaction(async (tx) => {
    const created = await tx.installmentReason.create({
      data: { installmentId, label, amount: amountCents, paidAmount: overflow },
    });
    if (overflow > 0) {
      await tx.installment.update({
        where: { id: installmentId },
        data: { unassignedPaidAmount: newUnassignedAmount },
      });
    }
    return created;
  });

  refreshPaths(installment.obligation.personId);
  return {};
}

export async function deleteInstallmentReason(reasonId: string) {
  const accountId = await getCurrentAccountId();
  const reason = await prisma.installmentReason.findFirst({
    where: { id: reasonId, installment: { obligation: { person: { accountId } } } },
    include: { installment: { include: { obligation: true } } },
  });
  if (!reason) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.installmentReason.delete({ where: { id: reasonId } });
    if (reason.paidAmount > 0) {
      await tx.installment.update({
        where: { id: reason.installmentId },
        data: { unassignedPaidAmount: { increment: reason.paidAmount } },
      });
    }
  });

  refreshPaths(reason.installment.obligation.personId);
}

export async function toggleReasonPaid(reasonId: string, paid: boolean) {
  const accountId = await getCurrentAccountId();
  const reason = await prisma.installmentReason.findFirst({
    where: { id: reasonId, installment: { obligation: { person: { accountId } } } },
    include: { installment: { include: { obligation: true } } },
  });
  if (!reason) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.installmentReason.update({
      where: { id: reasonId },
      data: { paidAmount: paid ? reason.amount : 0 },
    });
    await syncInstallmentPaidState(tx, reason.installmentId, null);
  });

  refreshPaths(reason.installment.obligation.personId);
}

export async function toggleUnassignedPaid(installmentId: string, paid: boolean) {
  const accountId = await getCurrentAccountId();
  const installment = await prisma.installment.findFirst({
    where: { id: installmentId, obligation: { person: { accountId } } },
    include: { reasons: true, obligation: true },
  });
  if (!installment) {
    return;
  }

  const unassigned = remainingAmount(installment.amount, installment.reasons);
  if (unassigned <= 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.installment.update({
      where: { id: installmentId },
      data: { unassignedPaidAmount: paid ? unassigned : 0 },
    });
    await syncInstallmentPaidState(tx, installmentId, null);
  });

  refreshPaths(installment.obligation.personId);
}

export async function registerInstallmentAbono(
  installmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const accountId = await getCurrentAccountId();
  const { t } = await getDictionary();
  const amountCents = parseAmountToCents(String(formData.get("amount") || ""));
  const methodRaw = String(formData.get("method") || "");
  const method = isPaymentMethod(methodRaw) ? methodRaw : null;

  if (!amountCents || amountCents <= 0) {
    return { error: t.errors.amountInvalid };
  }

  const installment = await prisma.installment.findFirst({
    where: { id: installmentId, obligation: { person: { accountId } } },
    include: { reasons: { orderBy: { createdAt: "asc" } }, obligation: true },
  });
  if (!installment) {
    return { error: t.errors.installmentMissing };
  }

  const buckets = buildBuckets(
    installment.amount,
    installment.reasons,
    installment.unassignedPaidAmount,
    t.reasons.noReason,
  );
  const owed = installment.amount - totalPaid(buckets);
  if (owed <= 0) {
    return { error: t.errors.abonoFull };
  }
  if (amountCents > owed) {
    return { error: t.errors.abonoExceedsOwed };
  }

  const updated = distributeAbono(buckets, amountCents);

  await prisma.$transaction(async (tx) => {
    for (const bucket of updated) {
      if (bucket.id === UNASSIGNED_BUCKET_ID) {
        await tx.installment.update({
          where: { id: installmentId },
          data: { unassignedPaidAmount: bucket.paidAmount },
        });
      } else {
        await tx.installmentReason.update({
          where: { id: bucket.id },
          data: { paidAmount: bucket.paidAmount },
        });
      }
    }
    await syncInstallmentPaidState(tx, installmentId, method);
  });

  refreshPaths(installment.obligation.personId);
  return {};
}

export async function deleteObligation(obligationId: string) {
  const accountId = await getCurrentAccountId();
  const obligation = await prisma.obligation.findFirst({
    where: { id: obligationId, person: { accountId } },
    select: { personId: true },
  });
  if (!obligation) {
    return;
  }

  await prisma.obligation.delete({ where: { id: obligationId } });
  refreshPaths(obligation.personId);
}

export async function deletePerson(personId: string) {
  const accountId = await getCurrentAccountId();
  await prisma.person.deleteMany({ where: { id: personId, accountId } });
  refreshPaths();
  redirect("/");
}
