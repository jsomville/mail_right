import type { Mail, PrismaClient } from "@prisma/client";

export class MailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<Mail[]> {
    return this.prisma.mail.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
