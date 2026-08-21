import { PrismaClient } from "@prisma/client";
import { splitInstallmentAmounts, monthlyDueDates } from "../lib/installments";

const prisma = new PrismaClient();

async function main() {
  await prisma.installment.deleteMany();
  await prisma.obligation.deleteMany();
  await prisma.person.deleteMany();

  const maria = await prisma.person.create({
    data: { name: "Maria Lopez", notes: "Neighbor" },
  });
  const james = await prisma.person.create({
    data: { name: "James Chen" },
  });

  const firstDue = new Date();
  firstDue.setUTCHours(0, 0, 0, 0);

  const installmentTotal = 70000;
  const count = 7;
  const amounts = splitInstallmentAmounts(installmentTotal, count);
  const dates = monthlyDueDates(firstDue, count);

  await prisma.obligation.create({
    data: {
      personId: maria.id,
      title: "Refrigerator",
      totalAmount: installmentTotal,
      currency: "USD",
      installmentCount: count,
      installments: {
        create: amounts.map((amount, index) => ({
          sequence: index + 1,
          amount,
          dueDate: dates[index],
          paidAt: index < 3 ? new Date() : null,
        })),
      },
    },
  });

  await prisma.obligation.create({
    data: {
      personId: james.id,
      title: "Airport taxi",
      totalAmount: 4500,
      currency: "USD",
      installmentCount: 1,
      installments: {
        create: {
          sequence: 1,
          amount: 4500,
          dueDate: firstDue,
        },
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
