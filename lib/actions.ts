"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  monthlyDueDates,
  splitInstallmentAmounts,
} from "@/lib/installments";
import { defaultCurrency, parseAmountToCents } from "@/lib/money";

export type ActionState = {
  error?: string;
};

export async function createPerson(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (!name) {
    return { error: "Name is required." };
  }

  await prisma.person.create({
    data: { name, notes: notes || null },
  });
  revalidatePath("/");
  revalidatePath("/obligations/new");
  return {};
}

export async function createObligation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") || "").trim();
  const personId = String(formData.get("personId") || "");
  const newPersonName = String(formData.get("newPersonName") || "").trim();
  const currency = (
    String(formData.get("currency") || defaultCurrency())
  )
    .trim()
    .toUpperCase();
  const installmentCount = Number(formData.get("installmentCount") || 1);
  const firstDueRaw = String(formData.get("firstDueDate") || "");
  const totalCents = parseAmountToCents(String(formData.get("totalAmount") || ""));

  if (!title) {
    return { error: "Reason or product is required." };
  }
  if (!totalCents || totalCents <= 0) {
    return { error: "Enter a valid amount (for example 120.50)." };
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    return { error: "Installments must be at least 1." };
  }
  if (installmentCount > 60) {
    return { error: "Keep installments to 60 or fewer." };
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { error: "Currency must be a 3-letter code." };
  }
  if (!firstDueRaw) {
    return { error: "A first due date is required." };
  }

  const firstDue = new Date(`${firstDueRaw}T00:00:00.000Z`);
  if (Number.isNaN(firstDue.getTime())) {
    return { error: "First due date is invalid." };
  }

  let resolvedPersonId = personId;
  if (personId === "__new__" || !personId) {
    if (!newPersonName) {
      return { error: "Choose a person or enter a new name." };
    }
    const person = await prisma.person.create({
      data: { name: newPersonName },
    });
    resolvedPersonId = person.id;
  } else {
    const existing = await prisma.person.findUnique({
      where: { id: personId },
    });
    if (!existing) {
      return { error: "That person was not found." };
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

  revalidatePath("/");
  revalidatePath(`/people/${resolvedPersonId}`);
  redirect(`/people/${resolvedPersonId}?created=${obligation.id}`);
}

export async function markInstallmentPaid(installmentId: string) {
  const installment = await prisma.installment.update({
    where: { id: installmentId },
    data: { paidAt: new Date() },
    include: { obligation: true },
  });
  revalidatePath("/");
  revalidatePath(`/people/${installment.obligation.personId}`);
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
  revalidatePath("/");
  revalidatePath("/obligations/new");
  revalidatePath(`/people/${obligation.personId}`);
}

export async function deletePerson(personId: string) {
  await prisma.person.delete({ where: { id: personId } });
  revalidatePath("/");
  revalidatePath("/obligations/new");
  redirect("/");
}
