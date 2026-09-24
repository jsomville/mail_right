import type { Mail, PrismaClient } from "@prisma/client";

export interface CreateMailInput {
  userId: string;
  mailInput: string;
  mailOutput: string;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
}

export type MailWithUser = Mail & {
  user: { id: string; email: string; firstname: string; lastname: string };
};

export class MailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string, take?: number): Promise<Mail[]> {
    return this.prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });
  }

  /** Full check history across all users, most recent first, for the admin dashboard. */
  async findAll(): Promise<MailWithUser[]> {
    return this.prisma.mail.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, firstname: true, lastname: true } },
      },
    });
  }

  async create(data: CreateMailInput): Promise<Mail> {
    return this.prisma.mail.create({ data });
  }

  /** Keeps only the `max` most recent mails for a user, deleting older ones. */
  async trimHistory(userId: string, max: number): Promise<void> {
    const total = await this.prisma.mail.count({ where: { userId } });
    if (total <= max) {
      return;
    }

    const excess = await this.prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: total - max,
      select: { id: true },
    });

    await this.prisma.mail.deleteMany({ where: { id: { in: excess.map((mail) => mail.id) } } });
  }
}
