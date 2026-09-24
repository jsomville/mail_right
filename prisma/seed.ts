import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SAMPLE_USER = {
  email: "demo@mail-right.com",
  password: "Password123!",
  firstname: "Demo",
  lastname: "User",
};

const SAMPLE_ADMIN = {
  email: "admin@mail-right.com",
  password: "AdminPassword123!",
  firstname: "Admin",
  lastname: "User",
};

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SAMPLE_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: SAMPLE_USER.email },
    update: {},
    create: {
      email: SAMPLE_USER.email,
      passwordHash,
      firstname: SAMPLE_USER.firstname,
      lastname: SAMPLE_USER.lastname,
      balance: 100,
    },
  });

  const adminPasswordHash = await bcrypt.hash(SAMPLE_ADMIN.password, 12);

  await prisma.user.upsert({
    where: { email: SAMPLE_ADMIN.email },
    update: {},
    create: {
      email: SAMPLE_ADMIN.email,
      passwordHash: adminPasswordHash,
      firstname: SAMPLE_ADMIN.firstname,
      lastname: SAMPLE_ADMIN.lastname,
      balance: 0,
      role: "ADMIN",
    },
  });

  const existingMails = await prisma.mail.count({ where: { userId: user.id } });
  if (existingMails === 0) {
    await prisma.mail.createMany({
      data: [
        {
          userId: user.id,
          mailInput: "Hi team, please review the attached report by Friday.",
          mailOutput: "Hello team,\n\nCould you please review the attached report by Friday?\n\nThank you.",
          promptTokens: 30,
          completionTokens: 12,
          cost: 0.02,
        },
        {
          userId: user.id,
          mailInput: "Can you send me the invoice again?",
          mailOutput: "Hello,\n\nCould you please resend the invoice at your earliest convenience?\n\nThank you.",
          promptTokens: 22,
          completionTokens: 9,
          cost: 0.01,
        },
      ],
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded sample user: ${SAMPLE_USER.email} / ${SAMPLE_USER.password}`);
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${SAMPLE_ADMIN.email} / ${SAMPLE_ADMIN.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
