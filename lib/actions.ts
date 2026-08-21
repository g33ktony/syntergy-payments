"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionary";
import { prisma } from "@/lib/db";
import {
  monthlyDueDates,
  splitInstallmentAmounts,
} from "@/lib/installments";
import { defaultCurrency, parseAmountToCents } from "@/lib/money";
import { isPaymentMethod, type PaymentMethod } from "@/lib/payment-method";

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
        name: newPersonName,
        nickname: newPersonNickname || null,
        phone: newPersonPhone || null,
      },
    });
    resolvedPersonId = person.id;
  } else {
    const existing = await prisma.person.findUnique({
      where: { id: personId },
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

  await prisma.person.update({
    where: { id: personId },
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
  refreshPaths(personId);
  return {};
}

export async function markInstallmentPaid(
  installmentId: string,
  method: PaymentMethod,
) {
  const { t } = await getDictionary();
  if (!isPaymentMethod(method)) {
    throw new Error(t.errors.paymentMethodRequired);
  }

  const installment = await prisma.installment.update({
    where: { id: installmentId },
    data: { paidAt: new Date(), paymentMethod: method },
    include: { obligation: true },
  });
  refreshPaths(installment.obligation.personId);
}

export async function deleteObligation(obligationId: string) {
  const obligation = await prisma.obligation.findUnique({
    where: { id: obligationId },
    select: { personId: true },
  });
  if (!obligation) {
    return;
  }

  await prisma.obligation.delete({ where: { id: obligationId } });
  refreshPaths(obligation.personId);
}

export async function deletePerson(personId: string) {
  await prisma.person.delete({ where: { id: personId } });
  refreshPaths();
  redirect("/");
}
